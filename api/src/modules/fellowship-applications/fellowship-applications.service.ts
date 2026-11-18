import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { and, desc, eq, ilike, notInArray, or, type SQL } from "drizzle-orm";
import { randomBytes } from "node:crypto";

import { sanitizeText } from "@/_shared/text";
import { uuid } from "@/_shared/team-helpers";
import { DATABASE } from "@/db/drizzle/drizzle.module";
import type { Database } from "@/db/drizzle/drizzle.client";
import {
  fellowshipAlumni,
  fellowshipApplications,
  FELLOWSHIP_APPLICATION_STAGES,
  type FellowshipApplicationRow,
  type FellowshipApplicationStage,
} from "@/db/drizzle/schema";
import type {
  BulkUpdateFellowshipApplicationsDto,
  CreateFellowshipApplicationDto,
  FellowshipApplicationStatusDto,
  UpdateFellowshipApplicationDto,
} from "@/modules/fellowship-applications/dto/fellowship-application.dto";

export type FellowshipApplicationPublicDto = {
  reference: string;
  name: string;
  email: string;
  city: string;
  track: string;
  cohort: string;
  stage: FellowshipApplicationStage;
  offerExpiresAt: string | null;
  waitlistPosition: number | null;
  waitlistExpiresAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type FellowshipApplicationAdminDto = FellowshipApplicationPublicDto & {
  id: string;
  phone: string;
  candidateStatus: string;
  motivation: string;
  fullTime: boolean;
  vipassana: boolean;
  fieldWork: boolean;
  termsAccepted: boolean;
  offerReminderSentAt: string | null;
  completedAt: string | null;
  candidateToken: string | null;
  notes: string;
};

const isStage = (value: string): value is FellowshipApplicationStage =>
  (FELLOWSHIP_APPLICATION_STAGES as readonly string[]).includes(value);

const toStage = (value: string): FellowshipApplicationStage =>
  isStage(value) ? value : "applied";

const toPublic = (row: FellowshipApplicationRow): FellowshipApplicationPublicDto => ({
  reference: row.reference,
  name: row.name,
  email: row.email,
  city: row.city ?? "",
  track: row.track,
  cohort: row.cohort,
  stage: toStage(row.stage),
  offerExpiresAt: row.offerExpiresAt ? row.offerExpiresAt.toISOString() : null,
  waitlistPosition: row.waitlistPosition ?? null,
  waitlistExpiresAt: row.waitlistExpiresAt
    ? row.waitlistExpiresAt.toISOString()
    : null,
  createdAt: row.createdAt.toISOString(),
  updatedAt: row.updatedAt.toISOString(),
});

const toAdmin = (row: FellowshipApplicationRow): FellowshipApplicationAdminDto => ({
  id: row.id,
  ...toPublic(row),
  phone: row.phone,
  candidateStatus: row.candidateStatus ?? "",
  motivation: row.motivation,
  fullTime: row.fullTime,
  vipassana: row.vipassana,
  fieldWork: row.fieldWork,
  termsAccepted: row.termsAccepted,
  offerReminderSentAt: row.offerReminderSentAt
    ? row.offerReminderSentAt.toISOString()
    : null,
  completedAt: row.completedAt ? row.completedAt.toISOString() : null,
  candidateToken: row.candidateToken ?? null,
  notes: row.notes ?? "",
});

const makeReference = (): string =>
  `KF-${new Date().getFullYear()}-${randomBytes(4).toString("hex").toUpperCase()}`;

const makeCandidateToken = (): string => randomBytes(24).toString("hex");

@Injectable()
export class FellowshipApplicationsService {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async submit(
    payload: CreateFellowshipApplicationDto,
  ): Promise<FellowshipApplicationPublicDto> {
    const name = sanitizeText(payload.name, 120);
    const email = sanitizeText(payload.email, 200).toLowerCase();
    const phone = sanitizeText(payload.phone, 30);
    const city = sanitizeText(payload.city, 160);
    const candidateStatus = sanitizeText(payload.candidateStatus, 80);
    const track = sanitizeText(payload.track, 120);
    const motivation = sanitizeText(payload.motivation, 4000);

    if (!name || !email || !phone || !track || !motivation) {
      throw new BadRequestException("Missing required application fields");
    }

    if (
      !payload.fullTime ||
      !payload.vipassana ||
      !payload.fieldWork ||
      !payload.termsAccepted
    ) {
      throw new BadRequestException("All programme commitments must be confirmed");
    }

    const [active] = await this.db
      .select({ reference: fellowshipApplications.reference })
      .from(fellowshipApplications)
      .where(
        and(
          eq(fellowshipApplications.email, email),
          notInArray(fellowshipApplications.stage, ["rejected", "withdrawn"]),
        ),
      )
      .limit(1);

    if (active) {
      throw new ConflictException(
        `An active application already exists for this email (${active.reference}). Use the status page or email us.`,
      );
    }

    const [row] = await this.db
      .insert(fellowshipApplications)
      .values({
        id: uuid(),
        reference: makeReference(),
        name,
        email,
        phone,
        city,
        candidateStatus,
        track,
        motivation,
        fullTime: true,
        vipassana: true,
        fieldWork: true,
        termsAccepted: true,
        stage: "applied",
        candidateToken: makeCandidateToken(),
      })
      .returning();

    return toPublic(row);
  }

  async status(
    payload: FellowshipApplicationStatusDto,
  ): Promise<FellowshipApplicationPublicDto> {
    const reference = sanitizeText(payload.reference, 32).toUpperCase();
    const email = sanitizeText(payload.email, 200).toLowerCase();

    const [row] = await this.db
      .select()
      .from(fellowshipApplications)
      .where(
        and(
          eq(fellowshipApplications.reference, reference),
          eq(fellowshipApplications.email, email),
        ),
      )
      .limit(1);

    if (!row) {
      throw new NotFoundException("Application not found");
    }

    return toPublic(row);
  }

  async list(options: { stage?: string; search?: string } = {}) {
    const filters: SQL[] = [];

    if (options.stage && isStage(options.stage)) {
      filters.push(eq(fellowshipApplications.stage, options.stage));
    }

    const search = sanitizeText(options.search, 160);
    if (search) {
      const pattern = `%${search}%`;
      const match = or(
        ilike(fellowshipApplications.name, pattern),
        ilike(fellowshipApplications.email, pattern),
        ilike(fellowshipApplications.reference, pattern),
        ilike(fellowshipApplications.track, pattern),
        ilike(fellowshipApplications.city, pattern),
        ilike(fellowshipApplications.cohort, pattern),
      );
      if (match) filters.push(match);
    }

    const rows = await this.db
      .select()
      .from(fellowshipApplications)
      .where(filters.length ? and(...filters) : undefined)
      .orderBy(desc(fellowshipApplications.createdAt));

    return { applications: rows.map(toAdmin) };
  }

  async update(
    id: string,
    payload: UpdateFellowshipApplicationDto,
  ): Promise<{
    application: FellowshipApplicationAdminDto;
    stageChanged: boolean;
    previousStage: FellowshipApplicationStage;
  }> {
    const [existing] = await this.db
      .select()
      .from(fellowshipApplications)
      .where(eq(fellowshipApplications.id, id))
      .limit(1);

    if (!existing) {
      throw new NotFoundException("Application not found");
    }

    const set: Partial<FellowshipApplicationRow> = { updatedAt: new Date() };
    if (payload.stage !== undefined) set.stage = payload.stage;
    if (payload.cohort !== undefined) set.cohort = sanitizeText(payload.cohort, 80);
    if (payload.notes !== undefined) set.notes = sanitizeText(payload.notes, 4000);

    if (payload.waitlistPosition !== undefined) {
      set.waitlistPosition = payload.waitlistPosition ?? null;
    }
    if (payload.waitlistExpiresAt !== undefined) {
      if (payload.waitlistExpiresAt === null) {
        set.waitlistExpiresAt = null;
      } else {
        const expires = new Date(payload.waitlistExpiresAt);
        if (Number.isNaN(expires.getTime())) {
          throw new BadRequestException("Invalid waitlist expiry date");
        }
        set.waitlistExpiresAt = expires;
      }
    }

    // A waitlisted application without a position/expiry is hard to operate.
    // Assign the next position and a 30-day review window once.
    if (payload.stage === "waitlisted") {
      if (payload.waitlistPosition === undefined && existing.waitlistPosition === null) {
        const rows = await this.db
          .select({ position: fellowshipApplications.waitlistPosition })
          .from(fellowshipApplications)
          .where(eq(fellowshipApplications.stage, "waitlisted"));
        const highest = rows.reduce(
          (max, row) => Math.max(max, row.position ?? 0),
          0,
        );
        set.waitlistPosition = highest + 1;
      }
      if (payload.waitlistExpiresAt === undefined && !existing.waitlistExpiresAt) {
        set.waitlistExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      }
    }

    if (payload.stage === "offer") {
      set.offerReminderSentAt = null;
    }
    if (payload.stage === "completed") {
      set.completedAt = existing.completedAt ?? new Date();
    }

    if (payload.offerExpiresAt !== undefined) {
      if (payload.offerExpiresAt === null) {
        set.offerExpiresAt = null;
      } else {
        const expires = new Date(payload.offerExpiresAt);
        if (Number.isNaN(expires.getTime())) {
          throw new BadRequestException("Invalid offer expiry date");
        }
        set.offerExpiresAt = expires;
      }
    }

    // An offer without a deadline reads as an open-ended promise. Default to
    // seven days; admins can change or clear it explicitly.
    if (payload.stage === "offer" && !existing.offerExpiresAt) {
      set.offerExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    }

    const [row] = await this.db
      .update(fellowshipApplications)
      .set(set)
      .where(eq(fellowshipApplications.id, id))
      .returning();

    const stageChanged = payload.stage !== undefined && payload.stage !== existing.stage;

    // Completing the fellowship creates the alumni record automatically so the
    // team has one place to track 6/12-month outcomes.
    if (row.stage === "completed") {
      const [alumni] = await this.db
        .select({ id: fellowshipAlumni.id })
        .from(fellowshipAlumni)
        .where(eq(fellowshipAlumni.applicationId, row.id))
        .limit(1);
      if (!alumni) {
        await this.db.insert(fellowshipAlumni).values({
          id: uuid(),
          applicationId: row.id,
          name: row.name,
          email: row.email,
          cohort: row.cohort,
          track: row.track,
          updateToken: randomBytes(24).toString("hex"),
          followUpDueAt: new Date(Date.now() + 182 * 24 * 60 * 60 * 1000),
        });
      }
    }

    return {
      application: toAdmin(row),
      stageChanged,
      previousStage: toStage(existing.stage),
    };
  }

  async bulkUpdate(payload: BulkUpdateFellowshipApplicationsDto) {
    const ids = Array.from(new Set(payload.ids));
    const applications: FellowshipApplicationAdminDto[] = [];
    const changedApplications: FellowshipApplicationAdminDto[] = [];
    let changed = 0;

    for (const id of ids) {
      const result = await this.update(id, { stage: payload.stage });
      applications.push(result.application);
      if (result.stageChanged) {
        changed += 1;
        changedApplications.push(result.application);
      }
    }

    return { applications, changed, changedApplications };
  }

  async findByCandidateToken(token: string) {
    const raw = sanitizeText(token, 80);
    const [row] = await this.db
      .select()
      .from(fellowshipApplications)
      .where(eq(fellowshipApplications.candidateToken, raw))
      .limit(1);
    if (!row) throw new NotFoundException("Offer not found");

    return {
      application: {
        reference: row.reference,
        name: row.name,
        track: row.track,
        cohort: row.cohort,
        stage: toStage(row.stage),
        offerExpiresAt: row.offerExpiresAt
          ? row.offerExpiresAt.toISOString()
          : null,
        waitlistPosition: row.waitlistPosition ?? null,
        updatedAt: row.updatedAt.toISOString(),
      },
    };
  }

  async respondToOffer(token: string, decision: "accept" | "decline") {
    const raw = sanitizeText(token, 80);
    const [row] = await this.db
      .select()
      .from(fellowshipApplications)
      .where(eq(fellowshipApplications.candidateToken, raw))
      .limit(1);
    if (!row) throw new NotFoundException("Offer not found");
    if (row.stage !== "offer") {
      throw new BadRequestException("This application is not awaiting an offer response");
    }
    if (row.offerExpiresAt && row.offerExpiresAt.getTime() < Date.now()) {
      throw new BadRequestException(
        "The offer response window has closed. Email the fellowship team.",
      );
    }

    const [updated] = await this.db
      .update(fellowshipApplications)
      .set({
        stage: decision === "accept" ? "accepted" : "withdrawn",
        waitlistPosition: null,
        waitlistExpiresAt: null,
        updatedAt: new Date(),
      })
      .where(eq(fellowshipApplications.id, row.id))
      .returning();

    return {
      application: toAdmin(updated),
      stageChanged: true,
      previousStage: toStage(row.stage),
    };
  }

  async remove(id: string) {
    const [row] = await this.db
      .delete(fellowshipApplications)
      .where(eq(fellowshipApplications.id, id))
      .returning({ id: fellowshipApplications.id });
    if (!row) throw new NotFoundException("Application not found");
    return { ok: true };
  }

  async dueOfferReminders(hours = 72) {
    const now = Date.now();
    const until = now + hours * 60 * 60 * 1000;
    const rows = await this.db
      .select()
      .from(fellowshipApplications)
      .where(eq(fellowshipApplications.stage, "offer"))
      .orderBy(fellowshipApplications.offerExpiresAt);

    return {
      applications: rows
        .filter(
          (row) =>
            row.offerExpiresAt !== null &&
            row.offerExpiresAt.getTime() >= now &&
            row.offerExpiresAt.getTime() <= until &&
            !row.offerReminderSentAt,
        )
        .map(toAdmin),
    };
  }

  async markOfferReminderSent(id: string) {
    await this.db
      .update(fellowshipApplications)
      .set({ offerReminderSentAt: new Date(), updatedAt: new Date() })
      .where(eq(fellowshipApplications.id, id));
    return { ok: true };
  }

  async exportCsv(options: { stage?: string; search?: string } = {}) {    const { applications } = await this.list(options);
    const headers = [
      "reference",
      "name",
      "email",
      "phone",
      "city",
      "track",
      "cohort",
      "stage",
      "waitlist_position",
      "waitlist_expires_at",
      "offer_expires_at",
      "created_at",
      "updated_at",
      "notes",
    ];
    const escape = (value: unknown): string =>
      `"${String(value ?? "").replace(/"/g, '""')}"`;
    const lines = [
      headers.join(","),
      ...applications.map((application) =>
        [
          application.reference,
          application.name,
          application.email,
          application.phone,
          application.city,
          application.track,
          application.cohort,
          application.stage,
          application.waitlistPosition,
          application.waitlistExpiresAt,
          application.offerExpiresAt,
          application.createdAt,
          application.updatedAt,
          application.notes,
        ]
          .map(escape)
          .join(","),
      ),
    ];

    return lines.join("\r\n");
  }
}
