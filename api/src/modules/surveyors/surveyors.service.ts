import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { and, desc, eq, ilike, or, type SQL } from "drizzle-orm";

import { uuid } from "@/_shared/team-helpers";
import { sanitizeText } from "@/_shared/text";
import { DATABASE } from "@/db/drizzle/drizzle.module";
import type { Database } from "@/db/drizzle/drizzle.client";
import {
  surveyors,
  SURVEYOR_STATUSES,
  type SurveyorRow,
  type SurveyorStatus,
} from "@/db/drizzle/schema";
import type { RegisterSurveyorDto, UpdateSurveyorDto } from "@/modules/surveyors/dto/surveyor.dto";

export type SurveyorDto = {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  languages: string[];
  skills: string[];
  experience: string;
  notes: string;
  status: SurveyorStatus;
  verifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

/* Internal notes are admin-only, so the public registration response returns a
   narrower shape instead of the full record. */
export type PublicSurveyorDto = Omit<SurveyorDto, "notes" | "verifiedAt">;

const isStatus = (value: string): value is SurveyorStatus =>
  (SURVEYOR_STATUSES as readonly string[]).includes(value);

const toDto = (row: SurveyorRow): SurveyorDto => ({
  id: row.id,
  name: row.name,
  email: row.email,
  phone: row.phone,
  location: row.location ?? "",
  languages: row.languages ?? [],
  skills: row.skills ?? [],
  experience: row.experience ?? "",
  notes: row.notes ?? "",
  status: isStatus(row.status) ? row.status : "applied",
  verifiedAt: row.verifiedAt ? row.verifiedAt.toISOString() : null,
  createdAt: row.createdAt.toISOString(),
  updatedAt: row.updatedAt.toISOString(),
});

const toPublic = (row: SurveyorRow): PublicSurveyorDto => {
  const dto = toDto(row);
  /* Explicit field list rather than object rest: internal notes and the
     verification timestamp must never reach the public response. */
  return {
    id: dto.id,
    name: dto.name,
    email: dto.email,
    phone: dto.phone,
    location: dto.location,
    languages: dto.languages,
    skills: dto.skills,
    experience: dto.experience,
    status: dto.status,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
};

const cleanList = (values: string[] | undefined, maxItems: number, maxLen: number): string[] => {
  if (!values?.length) return [];
  return Array.from(
    new Set(
      values
        .map((value) => sanitizeText(value, maxLen))
        .filter(Boolean),
    ),
  ).slice(0, maxItems);
};

@Injectable()
export class SurveyorsService {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async list(options: { status?: string; search?: string } = {}) {
    const filters: SQL[] = [];

    if (options.status && isStatus(options.status)) {
      filters.push(eq(surveyors.status, options.status));
    }

    const search = sanitizeText(options.search, 120);
    if (search) {
      const pattern = `%${search}%`;
      const match = or(
        ilike(surveyors.name, pattern),
        ilike(surveyors.email, pattern),
        ilike(surveyors.location, pattern),
      );
      if (match) filters.push(match);
    }

    const rows = await this.db
      .select()
      .from(surveyors)
      .where(filters.length ? and(...filters) : undefined)
      .orderBy(desc(surveyors.createdAt));

    return { surveyors: rows.map(toDto) };
  }

  /* Public registration. A repeat submission from the same email updates the
     existing profile and keeps its status, so re-registering never resets an
     already-verified surveyor back to "applied". */
  async register(payload: RegisterSurveyorDto): Promise<{ surveyor: PublicSurveyorDto }> {
    const name = sanitizeText(payload.name, 120);
    const email = sanitizeText(payload.email, 200).toLowerCase();
    const phone = sanitizeText(payload.phone, 30);

    if (!name || !email || !phone) {
      throw new BadRequestException("Name, email and phone are required");
    }

    const values = {
      name,
      email,
      phone,
      location: sanitizeText(payload.location, 160),
      languages: cleanList(payload.languages, 10, 60),
      skills: cleanList(payload.skills, 20, 60),
      experience: sanitizeText(payload.experience, 500),
    };

    const [existing] = await this.db
      .select()
      .from(surveyors)
      .where(eq(surveyors.email, email))
      .limit(1);

    if (existing) {
      const [row] = await this.db
        .update(surveyors)
        .set({ ...values, updatedAt: new Date() })
        .where(eq(surveyors.id, existing.id))
        .returning();

      return { surveyor: toPublic(row) };
    }

    const [row] = await this.db
      .insert(surveyors)
      .values({ id: uuid(), ...values, status: "applied" })
      .returning();

    return { surveyor: toPublic(row) };
  }

  async findOne(id: string): Promise<SurveyorDto> {
    const [row] = await this.db
      .select()
      .from(surveyors)
      .where(eq(surveyors.id, id))
      .limit(1);

    if (!row) throw new NotFoundException("Surveyor not found");
    return toDto(row);
  }

  async update(id: string, payload: UpdateSurveyorDto): Promise<SurveyorDto> {
    const [existing] = await this.db
      .select()
      .from(surveyors)
      .where(eq(surveyors.id, id))
      .limit(1);

    if (!existing) throw new NotFoundException("Surveyor not found");

    const set: Partial<SurveyorRow> = { updatedAt: new Date() };

    if (payload.name !== undefined) set.name = sanitizeText(payload.name, 120);
    if (payload.phone !== undefined) set.phone = sanitizeText(payload.phone, 30);
    if (payload.location !== undefined) set.location = sanitizeText(payload.location, 160);
    if (payload.experience !== undefined) set.experience = sanitizeText(payload.experience, 500);
    if (payload.notes !== undefined) set.notes = sanitizeText(payload.notes, 2000);
    if (payload.languages !== undefined) set.languages = cleanList(payload.languages, 10, 60);
    if (payload.skills !== undefined) set.skills = cleanList(payload.skills, 20, 60);

    if (payload.email !== undefined) {
      const email = sanitizeText(payload.email, 200).toLowerCase();
      if (email !== existing.email) {
        const [clash] = await this.db
          .select({ id: surveyors.id })
          .from(surveyors)
          .where(eq(surveyors.email, email))
          .limit(1);
        if (clash) throw new BadRequestException("Another surveyor already uses that email");
        set.email = email;
      }
    }

    if (payload.status !== undefined) {
      set.status = payload.status;
      // Stamp the verification date the first time a profile is verified, and
      // clear it if the profile goes back to applied/rejected.
      if (payload.status === "verified" || payload.status === "active") {
        set.verifiedAt = existing.verifiedAt ?? new Date();
      } else if (payload.status === "applied" || payload.status === "rejected") {
        set.verifiedAt = null;
      }
    }

    const [row] = await this.db
      .update(surveyors)
      .set(set)
      .where(eq(surveyors.id, id))
      .returning();

    return toDto(row);
  }

  async remove(id: string): Promise<{ ok: true }> {
    const [row] = await this.db
      .delete(surveyors)
      .where(eq(surveyors.id, id))
      .returning({ id: surveyors.id });

    if (!row) throw new NotFoundException("Surveyor not found");
    return { ok: true };
  }
}
