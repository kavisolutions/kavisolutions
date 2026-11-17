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
  fellowshipApplications,
  FELLOWSHIP_APPLICATION_STAGES,
  type FellowshipApplicationRow,
  type FellowshipApplicationStage,
} from "@/db/drizzle/schema";
import type {
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
  notes: row.notes ?? "",
});

const makeReference = (): string =>
  `KF-${new Date().getFullYear()}-${randomBytes(4).toString("hex").toUpperCase()}`;

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

    const [row] = await this.db
      .update(fellowshipApplications)
      .set(set)
      .where(eq(fellowshipApplications.id, id))
      .returning();

    return {
      application: toAdmin(row),
      stageChanged: payload.stage !== undefined && payload.stage !== existing.stage,
      previousStage: toStage(existing.stage),
    };
  }
}
