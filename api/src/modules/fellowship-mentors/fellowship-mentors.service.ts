import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { desc, eq } from "drizzle-orm";

import { sanitizeText } from "@/_shared/text";
import { uuid } from "@/_shared/team-helpers";
import { DATABASE } from "@/db/drizzle/drizzle.module";
import type { Database } from "@/db/drizzle/drizzle.client";
import {
  fellowshipMentors,
  FELLOWSHIP_MENTOR_STATUSES,
  type FellowshipMentorRow,
  type FellowshipMentorStatus,
} from "@/db/drizzle/schema";
import type {
  CreateFellowshipMentorDto,
  UpdateFellowshipMentorDto,
} from "@/modules/fellowship-mentors/dto/fellowship-mentor.dto";

export type FellowshipMentorDto = {
  id: string;
  name: string;
  email: string;
  phone: string;
  title: string;
  expertise: string;
  status: FellowshipMentorStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

const isStatus = (value: string): value is FellowshipMentorStatus =>
  (FELLOWSHIP_MENTOR_STATUSES as readonly string[]).includes(value);

const toDto = (row: FellowshipMentorRow): FellowshipMentorDto => ({
  id: row.id,
  name: row.name,
  email: row.email,
  phone: row.phone ?? "",
  title: row.title ?? "",
  expertise: row.expertise ?? "",
  status: isStatus(row.status) ? row.status : "active",
  notes: row.notes ?? "",
  createdAt: row.createdAt.toISOString(),
  updatedAt: row.updatedAt.toISOString(),
});

@Injectable()
export class FellowshipMentorsService {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async list(options: { status?: string } = {}) {
    const rows = await this.db
      .select()
      .from(fellowshipMentors)
      .where(
        options.status && isStatus(options.status)
          ? eq(fellowshipMentors.status, options.status)
          : undefined,
      )
      .orderBy(desc(fellowshipMentors.createdAt));

    return { mentors: rows.map(toDto) };
  }

  async create(payload: CreateFellowshipMentorDto): Promise<FellowshipMentorDto> {
    const name = sanitizeText(payload.name, 120);
    const email = sanitizeText(payload.email, 200).toLowerCase();
    if (!name || !email) throw new BadRequestException("Name and email are required");

    const [existing] = await this.db
      .select({ id: fellowshipMentors.id })
      .from(fellowshipMentors)
      .where(eq(fellowshipMentors.email, email))
      .limit(1);

    if (existing) throw new BadRequestException("A mentor already uses that email");

    const [row] = await this.db
      .insert(fellowshipMentors)
      .values({
        id: uuid(),
        name,
        email,
        phone: sanitizeText(payload.phone, 30),
        title: sanitizeText(payload.title, 120),
        expertise: sanitizeText(payload.expertise, 300),
        notes: sanitizeText(payload.notes, 2000),
        status: "active",
      })
      .returning();

    return toDto(row);
  }

  async update(id: string, payload: UpdateFellowshipMentorDto): Promise<FellowshipMentorDto> {
    const [existing] = await this.db
      .select()
      .from(fellowshipMentors)
      .where(eq(fellowshipMentors.id, id))
      .limit(1);

    if (!existing) throw new NotFoundException("Mentor not found");

    const set: Partial<FellowshipMentorRow> = { updatedAt: new Date() };
    if (payload.name !== undefined) set.name = sanitizeText(payload.name, 120);
    if (payload.phone !== undefined) set.phone = sanitizeText(payload.phone, 30);
    if (payload.title !== undefined) set.title = sanitizeText(payload.title, 120);
    if (payload.expertise !== undefined) set.expertise = sanitizeText(payload.expertise, 300);
    if (payload.notes !== undefined) set.notes = sanitizeText(payload.notes, 2000);
    if (payload.status !== undefined) set.status = payload.status;

    if (payload.email !== undefined) {
      const email = sanitizeText(payload.email, 200).toLowerCase();
      if (email !== existing.email) {
        const [clash] = await this.db
          .select({ id: fellowshipMentors.id })
          .from(fellowshipMentors)
          .where(eq(fellowshipMentors.email, email))
          .limit(1);
        if (clash) throw new BadRequestException("Another mentor already uses that email");
        set.email = email;
      }
    }

    const [row] = await this.db
      .update(fellowshipMentors)
      .set(set)
      .where(eq(fellowshipMentors.id, id))
      .returning();

    return toDto(row);
  }

  async remove(id: string): Promise<{ ok: true }> {
    const [row] = await this.db
      .delete(fellowshipMentors)
      .where(eq(fellowshipMentors.id, id))
      .returning({ id: fellowshipMentors.id });

    if (!row) throw new NotFoundException("Mentor not found");
    return { ok: true };
  }
}
