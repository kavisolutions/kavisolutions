import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { and, desc, eq, ilike, or, type SQL } from "drizzle-orm";
import { randomBytes } from "node:crypto";

import { sanitizeText } from "@/_shared/text";
import { uuid } from "@/_shared/team-helpers";
import { DATABASE } from "@/db/drizzle/drizzle.module";
import type { Database } from "@/db/drizzle/drizzle.client";
import {
  fellowshipAlumni,
  type FellowshipAlumniRow,
} from "@/db/drizzle/schema";
import type {
  AlumniSelfUpdateDto,
  CreateFellowshipAlumniDto,
  UpdateFellowshipAlumniDto,
} from "@/modules/fellowship-alumni/dto/fellowship-alumni.dto";

export type FellowshipAlumniDto = {
  id: string;
  applicationId: string | null;
  name: string;
  email: string;
  cohort: string;
  track: string;
  destinationType: string;
  organisation: string;
  role: string;
  outcome6m: string;
  outcome12m: string;
  mentorWilling: boolean;
  testimonialConsent: boolean;
  followUpDueAt: string | null;
  followUpSentAt: string | null;
  publicStory: string;
  storyPublished: boolean;
  updateToken: string;
  verifiedAt: string | null;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

const toDto = (row: FellowshipAlumniRow): FellowshipAlumniDto => ({
  id: row.id,
  applicationId: row.applicationId ?? null,
  name: row.name,
  email: row.email,
  cohort: row.cohort ?? "",
  track: row.track ?? "",
  destinationType: row.destinationType ?? "",
  organisation: row.organisation ?? "",
  role: row.role ?? "",
  outcome6m: row.outcome6m ?? "",
  outcome12m: row.outcome12m ?? "",
  mentorWilling: row.mentorWilling,
  testimonialConsent: row.testimonialConsent,
  followUpDueAt: row.followUpDueAt ? row.followUpDueAt.toISOString() : null,
  followUpSentAt: row.followUpSentAt ? row.followUpSentAt.toISOString() : null,
  publicStory: row.publicStory ?? "",
  storyPublished: row.storyPublished,
  updateToken: row.updateToken ?? "",
  verifiedAt: row.verifiedAt ? row.verifiedAt.toISOString() : null,
  notes: row.notes ?? "",
  createdAt: row.createdAt.toISOString(),
  updatedAt: row.updatedAt.toISOString(),
});

@Injectable()
export class FellowshipAlumniService {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async list(options: { search?: string; cohort?: string } = {}) {
    const filters: SQL[] = [];
    const search = sanitizeText(options.search, 160);
    if (search) {
      const pattern = `%${search}%`;
      const match = or(
        ilike(fellowshipAlumni.name, pattern),
        ilike(fellowshipAlumni.email, pattern),
        ilike(fellowshipAlumni.organisation, pattern),
        ilike(fellowshipAlumni.role, pattern),
        ilike(fellowshipAlumni.track, pattern),
      );
      if (match) filters.push(match);
    }
    const cohort = sanitizeText(options.cohort, 80);
    if (cohort) filters.push(eq(fellowshipAlumni.cohort, cohort));

    const rows = await this.db
      .select()
      .from(fellowshipAlumni)
      .where(filters.length ? and(...filters) : undefined)
      .orderBy(desc(fellowshipAlumni.createdAt));

    // Older records created before self-service links existed get a token and a
    // follow-up date on first list rather than becoming permanently unreachable.
    for (const row of rows) {
      if (!row.updateToken || !row.followUpDueAt) {
        const updateToken = row.updateToken ?? randomBytes(24).toString("hex");
        const followUpDueAt =
          row.followUpDueAt ?? new Date(Date.now() + 182 * 24 * 60 * 60 * 1000);
        await this.db
          .update(fellowshipAlumni)
          .set({ updateToken, followUpDueAt })
          .where(eq(fellowshipAlumni.id, row.id));
        row.updateToken = updateToken;
        row.followUpDueAt = followUpDueAt;
      }
    }

    return { alumni: rows.map(toDto) };
  }

  async create(payload: CreateFellowshipAlumniDto): Promise<{ alumni: FellowshipAlumniDto }> {
    const name = sanitizeText(payload.name, 120);
    const email = sanitizeText(payload.email, 200).toLowerCase();
    if (!name || !email) throw new BadRequestException("Name and email are required");

    const [row] = await this.db
      .insert(fellowshipAlumni)
      .values({
        id: uuid(),
        applicationId: payload.applicationId || null,
        name,
        email,
        cohort: sanitizeText(payload.cohort, 80),
        track: sanitizeText(payload.track, 120),
        destinationType: sanitizeText(payload.destinationType, 80),
        organisation: sanitizeText(payload.organisation, 200),
        role: sanitizeText(payload.role, 160),
        outcome6m: sanitizeText(payload.outcome6m, 1000),
        outcome12m: sanitizeText(payload.outcome12m, 1000),
        mentorWilling: payload.mentorWilling ?? false,
        testimonialConsent: payload.testimonialConsent ?? false,
        followUpDueAt: payload.followUpDueAt
          ? new Date(payload.followUpDueAt)
          : new Date(Date.now() + 182 * 24 * 60 * 60 * 1000),
        publicStory: sanitizeText(payload.publicStory, 4000),
        storyPublished: payload.storyPublished ?? false,
        updateToken: randomBytes(24).toString("hex"),
        verifiedAt: payload.verified ? new Date() : null,
        notes: sanitizeText(payload.notes, 4000),
      })
      .returning();

    return { alumni: toDto(row) };
  }

  async update(id: string, payload: UpdateFellowshipAlumniDto) {
    const [existing] = await this.db
      .select()
      .from(fellowshipAlumni)
      .where(eq(fellowshipAlumni.id, id))
      .limit(1);
    if (!existing) throw new NotFoundException("Alumni record not found");

    const set: Partial<FellowshipAlumniRow> = { updatedAt: new Date() };
    if (payload.name !== undefined) set.name = sanitizeText(payload.name, 120);
    if (payload.email !== undefined) {
      set.email = sanitizeText(payload.email, 200).toLowerCase();
    }
    if (payload.cohort !== undefined) set.cohort = sanitizeText(payload.cohort, 80);
    if (payload.track !== undefined) set.track = sanitizeText(payload.track, 120);
    if (payload.destinationType !== undefined) {
      set.destinationType = sanitizeText(payload.destinationType, 80);
    }
    if (payload.organisation !== undefined) {
      set.organisation = sanitizeText(payload.organisation, 200);
    }
    if (payload.role !== undefined) set.role = sanitizeText(payload.role, 160);
    if (payload.outcome6m !== undefined) set.outcome6m = sanitizeText(payload.outcome6m, 1000);
    if (payload.outcome12m !== undefined) {
      set.outcome12m = sanitizeText(payload.outcome12m, 1000);
    }
    if (payload.mentorWilling !== undefined) set.mentorWilling = payload.mentorWilling;
    if (payload.testimonialConsent !== undefined) {
      set.testimonialConsent = payload.testimonialConsent;
    }
    if (payload.followUpDueAt !== undefined) {
      set.followUpDueAt = payload.followUpDueAt
        ? new Date(payload.followUpDueAt)
        : null;
    }
    if (payload.publicStory !== undefined) {
      set.publicStory = sanitizeText(payload.publicStory, 4000);
    }
    if (payload.storyPublished !== undefined) {
      set.storyPublished = payload.storyPublished;
    }
    if (payload.verified !== undefined) {
      set.verifiedAt = payload.verified ? new Date() : null;
    }
    if (payload.notes !== undefined) set.notes = sanitizeText(payload.notes, 4000);

    const [row] = await this.db
      .update(fellowshipAlumni)
      .set(set)
      .where(eq(fellowshipAlumni.id, id))
      .returning();

    return { alumni: toDto(row) };
  }

  async remove(id: string): Promise<{ ok: true }> {
    const [row] = await this.db
      .delete(fellowshipAlumni)
      .where(eq(fellowshipAlumni.id, id))
      .returning({ id: fellowshipAlumni.id });
    if (!row) throw new NotFoundException("Alumni record not found");
    return { ok: true };
  }

  async publicStories() {
    const rows = await this.db
      .select()
      .from(fellowshipAlumni)
      .where(
        and(
          eq(fellowshipAlumni.storyPublished, true),
          eq(fellowshipAlumni.testimonialConsent, true),
        ),
      )
      .orderBy(desc(fellowshipAlumni.updatedAt))
      .limit(24);

    const publicName = (name: string): string => {
      const parts = name.trim().split(/\s+/).filter(Boolean);
      if (parts.length <= 1) return parts[0] ?? "Kavi Fellow";
      return `${parts[0]} ${parts[parts.length - 1][0]}.`;
    };

    return {
      stories: rows
        .filter((row) => row.publicStory.trim().length > 0)
        .map((row) => ({
          name: publicName(row.name),
          cohort: row.cohort,
          track: row.track,
          destinationType: row.destinationType,
          organisation: row.organisation,
          role: row.role,
          story: row.publicStory,
        })),
    };
  }

  async findByUpdateToken(rawToken: string) {
    const token = sanitizeText(rawToken, 80);
    const [row] = await this.db
      .select()
      .from(fellowshipAlumni)
      .where(eq(fellowshipAlumni.updateToken, token))
      .limit(1);
    if (!row) throw new NotFoundException("Alumni record not found");
    return {
      alumni: {
        name: row.name,
        email: row.email,
        cohort: row.cohort,
        track: row.track,
        destinationType: row.destinationType,
        organisation: row.organisation,
        role: row.role,
        outcome6m: row.outcome6m,
        outcome12m: row.outcome12m,
        mentorWilling: row.mentorWilling,
        testimonialConsent: row.testimonialConsent,
        publicStory: row.publicStory,
        storyPublished: row.storyPublished,
      },
    };
  }

  async updateByToken(rawToken: string, payload: AlumniSelfUpdateDto) {
    const token = sanitizeText(rawToken, 80);
    const [existing] = await this.db
      .select()
      .from(fellowshipAlumni)
      .where(eq(fellowshipAlumni.updateToken, token))
      .limit(1);
    if (!existing) throw new NotFoundException("Alumni record not found");

    const set: Partial<FellowshipAlumniRow> = { updatedAt: new Date() };
    if (payload.destinationType !== undefined) {
      set.destinationType = sanitizeText(payload.destinationType, 80);
    }
    if (payload.organisation !== undefined) {
      set.organisation = sanitizeText(payload.organisation, 200);
    }
    if (payload.role !== undefined) set.role = sanitizeText(payload.role, 160);
    if (payload.outcome6m !== undefined) set.outcome6m = sanitizeText(payload.outcome6m, 1000);
    if (payload.outcome12m !== undefined) {
      set.outcome12m = sanitizeText(payload.outcome12m, 1000);
    }
    if (payload.mentorWilling !== undefined) set.mentorWilling = payload.mentorWilling;
    if (payload.testimonialConsent !== undefined) {
      set.testimonialConsent = payload.testimonialConsent;
    }
    if (payload.publicStory !== undefined) {
      set.publicStory = sanitizeText(payload.publicStory, 4000);
    }

    const [row] = await this.db
      .update(fellowshipAlumni)
      .set(set)
      .where(eq(fellowshipAlumni.id, existing.id))
      .returning();

    return { alumni: toDto(row) };
  }

  async dueFollowUps(limit = 50) {
    const now = Date.now();
    const rows = await this.db
      .select()
      .from(fellowshipAlumni)
      .orderBy(fellowshipAlumni.followUpDueAt);
    return {
      alumni: rows
        .filter(
          (row) =>
            row.followUpDueAt !== null &&
            row.followUpDueAt.getTime() <= now &&
            (!row.followUpSentAt ||
              row.followUpSentAt.getTime() < row.followUpDueAt.getTime()),
        )
        .slice(0, limit)
        .map(toDto),
    };
  }

  async markFollowUpSent(id: string) {
    await this.db
      .update(fellowshipAlumni)
      .set({ followUpSentAt: new Date(), updatedAt: new Date() })
      .where(eq(fellowshipAlumni.id, id));
    return { ok: true };
  }

  async summary() {
    const rows = await this.db.select().from(fellowshipAlumni);
    const byDestination: Record<string, number> = {};
    const byCohort: Record<string, number> = {};
    for (const row of rows) {
      const destination = row.destinationType || "unknown";
      byDestination[destination] = (byDestination[destination] ?? 0) + 1;
      const cohort = row.cohort || "unassigned";
      byCohort[cohort] = (byCohort[cohort] ?? 0) + 1;
    }
    return {
      total: rows.length,
      mentorWilling: rows.filter((row) => row.mentorWilling).length,
      published: rows.filter((row) => row.storyPublished).length,
      byDestination,
      byCohort,
    };
  }
}
