import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { AuthService } from "@/auth/auth.service";
import type { SessionUser } from "@/auth/auth.types";
import { DATABASE } from "@/db/drizzle/drizzle.module";
import type { Database } from "@/db/drizzle/drizzle.client";
import {
  getInitials,
  isEmail,
  normalizeGradient,
  sanitizeText,
} from "@/_shared/text";
import {
  readOrgOptions,
  readTeamSettings,
  toTeamMember,
  type TeamMemberDto,
  type TeamWithTeamName,
} from "@/_shared/team-helpers";
import { CreateMemberDto, UpdateMemberDto } from "@/modules/team/dto/team.dto";
import { TeamRepository } from "@/modules/team/team.repository";

@Injectable()
export class TeamService {
  constructor(
    private readonly repo: TeamRepository,
    private readonly authService: AuthService,
    @Inject(DATABASE) private readonly db: Database,
  ) {}

  async list(user: SessionUser | null, isAdmin: boolean) {
    const [rows, settings, options] = await Promise.all([
      this.repo.findAll(),
      readTeamSettings(this.db),
      readOrgOptions(this.db),
    ]);

    const own = user ? rows.find((row) => row.userId === user.id) ?? null : null;

    return {
      members: rows.map(toTeamMember),
      roles: options.roles,
      teams: options.teams,
      settings: { tagline: settings.tagline, description: settings.description },
      isAdmin,
      member: own ? toTeamMember(own) : null,
      user: user ? { id: user.id, email: user.email ?? "" } : null,
    };
  }

  async create(payload: CreateMemberDto): Promise<{ member: TeamMemberDto; linkedEmail: string | null }> {
    const name = sanitizeText(payload.name, 120);
    if (!name) throw new BadRequestException("Name is required");

    const role = sanitizeText(payload.role, 120);
    const bio = sanitizeText(payload.bio, 2000);
    const profileUrl = sanitizeText(payload.profileUrl, 500) || null;
    const linkedinUrl = sanitizeText(payload.linkedinUrl, 500) || null;
    const imageUrl = sanitizeText(payload.imageUrl, 1000) || null;
    const gradient = normalizeGradient(payload.gradient);
    const sortOrder = Number.isFinite(Number(payload.sortOrder)) ? Number(payload.sortOrder) : 0;
    const teamId = sanitizeText(payload.teamId, 60) || null;
    const loginEmail = sanitizeText(payload.email, 254).toLowerCase();
    const loginPassword = typeof payload.password === "string" ? payload.password : "";

    let userId: string | null = null;
    let linkedEmail: string | null = null;

    if (loginEmail) {
      if (!isEmail(loginEmail)) {
        throw new BadRequestException("Enter a valid email address");
      }
      userId = await this.ensureLoginUser(loginEmail, loginPassword);
      linkedEmail = loginEmail;
    }

    const member = await this.repo.create({
      id: crypto.randomUUID(),
      name,
      role,
      bio,
      initials: getInitials(name),
      gradient,
      imageUrl,
      profileUrl,
      linkedinUrl,
      sortOrder,
      userId,
      teamId,
    });

    return { member: toTeamMember(member), linkedEmail };
  }

  async update(
    id: string,
    payload: UpdateMemberDto,
    user: SessionUser,
    isAdmin: boolean,
  ): Promise<TeamMemberDto> {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundException("Member not found");

    const isOwner = existing.userId === user.id;
    if (!isAdmin && !isOwner) {
      throw new ForbiddenException("Not allowed");
    }

    const patch: Record<string, unknown> = {};

    if (payload.name !== undefined) {
      const name = sanitizeText(payload.name, 120);
      if (!name) throw new BadRequestException("Name cannot be empty");
      patch.name = name;
      patch.initials = getInitials(name);
    }

    if (payload.role !== undefined) patch.role = sanitizeText(payload.role, 120);
    if (payload.bio !== undefined) patch.bio = sanitizeText(payload.bio, 2000);
    if (payload.imageUrl !== undefined) {
      patch.imageUrl = sanitizeText(payload.imageUrl, 1000) || null;
    }
    if (payload.gradient !== undefined) patch.gradient = normalizeGradient(payload.gradient);
    if (payload.profileUrl !== undefined) {
      patch.profileUrl = sanitizeText(payload.profileUrl, 500) || null;
    }
    if (payload.linkedinUrl !== undefined) {
      patch.linkedinUrl = sanitizeText(payload.linkedinUrl, 500) || null;
    }
    if (isAdmin && payload.sortOrder !== undefined && Number.isFinite(Number(payload.sortOrder))) {
      patch.sortOrder = Number(payload.sortOrder);
    }
    if (isAdmin && payload.teamId !== undefined) {
      patch.teamId = sanitizeText(payload.teamId, 60) || null;
    }

    if (Object.keys(patch).length === 0) {
      throw new BadRequestException("Nothing to update");
    }

    const updated = await this.repo.update(id, patch);
    if (!updated) throw new NotFoundException("Member not found");

    return toTeamMember(updated);
  }

  async remove(id: string): Promise<void> {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundException("Member not found");
    await this.repo.delete(id);
  }

  async me(user: SessionUser, isAdmin: boolean) {
    const member = await this.repo.findByUserId(user.id);
    const options = await readOrgOptions(this.db);

    return {
      user: { id: user.id, email: user.email ?? "" },
      isAdmin,
      roles: options.roles,
      teams: options.teams,
      member: member ? toTeamMember(member) : null,
    };
  }

  private async ensureLoginUser(email: string, password: string): Promise<string> {
    const context = await this.authService.instance.$context;
    const existing = await context.internalAdapter.findUserByEmail(email);
    if (existing) return existing.user.id;

    if (password.length < 8) {
      throw new BadRequestException(
        "Password must be at least 8 characters for a new login",
      );
    }

    try {
      const created = await context.internalAdapter.createUser(
        {
          email,
          name: email.split("@")[0],
          emailVerified: true,
          role: "user",
        },
        { method: "admin" },
      );

      const hashed = await context.password.hash(password);
      await context.internalAdapter.linkAccount({
        providerId: "credential",
        accountId: created.id,
        userId: created.id,
        password: hashed,
      });

      return created.id;
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ConflictException("A user with that email already exists");
      }
      throw error;
    }
  }
}

const isUniqueViolation = (error: unknown): boolean =>
  typeof error === "object" &&
  error !== null &&
  "code" in error &&
  (error as { code?: string }).code === "23505";

export type { TeamWithTeamName };
