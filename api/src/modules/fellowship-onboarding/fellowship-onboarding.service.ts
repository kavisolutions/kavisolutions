import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { desc, eq } from "drizzle-orm";

import { sanitizeText } from "@/_shared/text";
import { uuid } from "@/_shared/team-helpers";
import { DATABASE } from "@/db/drizzle/drizzle.module";
import type { Database } from "@/db/drizzle/drizzle.client";
import {
  fellowshipApplications,
  fellowshipOnboarding,
  type FellowshipApplicationRow,
  type FellowshipOnboardingRow,
} from "@/db/drizzle/schema";
import type { UpsertFellowshipOnboardingDto } from "@/modules/fellowship-onboarding/dto/fellowship-onboarding.dto";

export type FellowshipOnboardingDto = {
  id: string | null;
  applicationId: string;
  reference: string;
  name: string;
  email: string;
  track: string;
  cohort: string;
  stage: string;
  idVerified: boolean;
  educationVerified: boolean;
  emergencyContact: string;
  medicalNotes: string;
  codeOfConduct: boolean;
  poshAck: boolean;
  mediaConsent: boolean;
  deviceNeeds: string;
  baselineDone: boolean;
  vipassanaAck: boolean;
  notes: string;
  complete: boolean;
  completedItems: number;
  totalItems: number;
  updatedAt: string | null;
};

const TOTAL_ITEMS = 8;

const completedItems = (row: FellowshipOnboardingRow): number => {
  const values = [
    row.idVerified,
    row.educationVerified,
    Boolean(row.emergencyContact.trim()),
    row.codeOfConduct,
    row.poshAck,
    row.mediaConsent,
    row.baselineDone,
    row.vipassanaAck,
  ];
  return values.filter(Boolean).length;
};

const toDto = (
  application: FellowshipApplicationRow,
  row: FellowshipOnboardingRow | null,
): FellowshipOnboardingDto => {
  const completed = row ? completedItems(row) : 0;
  return {
    id: row?.id ?? null,
    applicationId: application.id,
    reference: application.reference,
    name: application.name,
    email: application.email,
    track: application.track,
    cohort: application.cohort,
    stage: application.stage,
    idVerified: row?.idVerified ?? false,
    educationVerified: row?.educationVerified ?? false,
    emergencyContact: row?.emergencyContact ?? "",
    medicalNotes: row?.medicalNotes ?? "",
    codeOfConduct: row?.codeOfConduct ?? false,
    poshAck: row?.poshAck ?? false,
    mediaConsent: row?.mediaConsent ?? false,
    deviceNeeds: row?.deviceNeeds ?? "",
    baselineDone: row?.baselineDone ?? false,
    vipassanaAck: row?.vipassanaAck ?? false,
    notes: row?.notes ?? "",
    complete: completed >= TOTAL_ITEMS,
    completedItems: completed,
    totalItems: TOTAL_ITEMS,
    updatedAt: row ? row.updatedAt.toISOString() : null,
  };
};

@Injectable()
export class FellowshipOnboardingService {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  private async application(id: string): Promise<FellowshipApplicationRow> {
    const [row] = await this.db
      .select()
      .from(fellowshipApplications)
      .where(eq(fellowshipApplications.id, id))
      .limit(1);
    if (!row) throw new NotFoundException("Application not found");
    return row;
  }

  async list() {
    const rows = await this.db
      .select()
      .from(fellowshipOnboarding)
      .orderBy(desc(fellowshipOnboarding.updatedAt));

    const applications = rows.length
      ? await this.db.select().from(fellowshipApplications)
      : [];
    const byId = new Map(applications.map((application) => [application.id, application]));

    const onboardings = rows
      .map((row) => {
        const application = byId.get(row.applicationId);
        return application ? toDto(application, row) : null;
      })
      .filter((entry): entry is FellowshipOnboardingDto => Boolean(entry));

    return { onboardings };
  }

  async get(applicationId: string) {
    const application = await this.application(applicationId);
    const [row] = await this.db
      .select()
      .from(fellowshipOnboarding)
      .where(eq(fellowshipOnboarding.applicationId, applicationId))
      .limit(1);

    return { onboarding: toDto(application, row ?? null) };
  }

  async upsert(applicationId: string, payload: UpsertFellowshipOnboardingDto) {
    const application = await this.application(applicationId);

    const [existing] = await this.db
      .select()
      .from(fellowshipOnboarding)
      .where(eq(fellowshipOnboarding.applicationId, applicationId))
      .limit(1);

    const values: Partial<FellowshipOnboardingRow> = { updatedAt: new Date() };
    if (payload.idVerified !== undefined) values.idVerified = payload.idVerified;
    if (payload.educationVerified !== undefined) {
      values.educationVerified = payload.educationVerified;
    }
    if (payload.emergencyContact !== undefined) {
      values.emergencyContact = sanitizeText(payload.emergencyContact, 300);
    }
    if (payload.medicalNotes !== undefined) {
      values.medicalNotes = sanitizeText(payload.medicalNotes, 2000);
    }
    if (payload.codeOfConduct !== undefined) values.codeOfConduct = payload.codeOfConduct;
    if (payload.poshAck !== undefined) values.poshAck = payload.poshAck;
    if (payload.mediaConsent !== undefined) values.mediaConsent = payload.mediaConsent;
    if (payload.deviceNeeds !== undefined) {
      values.deviceNeeds = sanitizeText(payload.deviceNeeds, 1000);
    }
    if (payload.baselineDone !== undefined) values.baselineDone = payload.baselineDone;
    if (payload.vipassanaAck !== undefined) values.vipassanaAck = payload.vipassanaAck;
    if (payload.notes !== undefined) values.notes = sanitizeText(payload.notes, 4000);

    const [row] = existing
      ? await this.db
          .update(fellowshipOnboarding)
          .set(values)
          .where(eq(fellowshipOnboarding.id, existing.id))
          .returning()
      : await this.db
          .insert(fellowshipOnboarding)
          .values({
            id: uuid(),
            applicationId,
            idVerified: values.idVerified ?? false,
            educationVerified: values.educationVerified ?? false,
            emergencyContact: values.emergencyContact ?? "",
            medicalNotes: values.medicalNotes ?? "",
            codeOfConduct: values.codeOfConduct ?? false,
            poshAck: values.poshAck ?? false,
            mediaConsent: values.mediaConsent ?? false,
            deviceNeeds: values.deviceNeeds ?? "",
            baselineDone: values.baselineDone ?? false,
            vipassanaAck: values.vipassanaAck ?? false,
            notes: values.notes ?? "",
          })
          .returning();

    return { onboarding: toDto(application, row) };
  }
}
