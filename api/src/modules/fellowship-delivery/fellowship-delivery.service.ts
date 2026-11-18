import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { and, desc, eq } from "drizzle-orm";

import { sanitizeText } from "@/_shared/text";
import { uuid } from "@/_shared/team-helpers";
import { DATABASE } from "@/db/drizzle/drizzle.module";
import type { Database } from "@/db/drizzle/drizzle.client";
import {
  fellowshipApplications,
  fellowshipDeliveryReviews,
  type FellowshipApplicationRow,
  type FellowshipDeliveryReviewRow,
} from "@/db/drizzle/schema";
import type {
  CreateFellowshipDeliveryReviewDto,
  UpdateFellowshipDeliveryReviewDto,
} from "@/modules/fellowship-delivery/dto/fellowship-delivery.dto";

export type FellowshipDeliveryReviewDto = {
  id: string;
  applicationId: string;
  reference: string;
  candidateName: string;
  candidateEmail: string;
  track: string;
  cohort: string;
  type: string;
  phase: string;
  week: number | null;
  reviewerName: string;
  reviewerEmail: string;
  attendancePercent: number | null;
  deliverableScore: number | null;
  collaborationScore: number | null;
  fieldScore: number | null;
  notes: string;
  atRisk: boolean;
  riskNotes: string;
  createdAt: string;
  updatedAt: string;
};

const toDto = (
  row: FellowshipDeliveryReviewRow,
  application: FellowshipApplicationRow,
): FellowshipDeliveryReviewDto => ({
  id: row.id,
  applicationId: row.applicationId,
  reference: application.reference,
  candidateName: application.name,
  candidateEmail: application.email,
  track: application.track,
  cohort: application.cohort,
  type: row.type,
  phase: row.phase,
  week: row.week,
  reviewerName: row.reviewerName,
  reviewerEmail: row.reviewerEmail,
  attendancePercent: row.attendancePercent,
  deliverableScore: row.deliverableScore,
  collaborationScore: row.collaborationScore,
  fieldScore: row.fieldScore,
  notes: row.notes,
  atRisk: row.atRisk,
  riskNotes: row.riskNotes,
  createdAt: row.createdAt.toISOString(),
  updatedAt: row.updatedAt.toISOString(),
});

const scoreValue = (value: number | undefined): number | null =>
  value === undefined ? null : value;

@Injectable()
export class FellowshipDeliveryService {
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

  async list(options: { applicationId?: string; atRisk?: boolean } = {}) {
    const filters = [];
    if (options.applicationId) {
      filters.push(eq(fellowshipDeliveryReviews.applicationId, options.applicationId));
    }
    if (options.atRisk !== undefined) {
      filters.push(eq(fellowshipDeliveryReviews.atRisk, options.atRisk));
    }

    const rows = await this.db
      .select()
      .from(fellowshipDeliveryReviews)
      .where(filters.length ? and(...filters) : undefined)
      .orderBy(desc(fellowshipDeliveryReviews.createdAt));

    const applications = await this.db.select().from(fellowshipApplications);
    const byId = new Map(applications.map((application) => [application.id, application]));    const reviews = rows
      .map((row) => {
        const application = byId.get(row.applicationId);
        return application ? toDto(row, application) : null;
      })
      .filter((entry): entry is FellowshipDeliveryReviewDto => Boolean(entry));

    return {
      reviews,
      atRiskCount: reviews.filter((review) => review.atRisk).length,
    };
  }

  async create(payload: CreateFellowshipDeliveryReviewDto) {
    const application = await this.application(payload.applicationId);
    const [row] = await this.db
      .insert(fellowshipDeliveryReviews)
      .values({
        id: uuid(),
        applicationId: application.id,
        type: payload.type,
        phase: sanitizeText(payload.phase, 80),
        week: payload.week ?? null,
        reviewerName: sanitizeText(payload.reviewerName, 120),
        reviewerEmail: sanitizeText(payload.reviewerEmail, 200).toLowerCase(),
        attendancePercent: payload.attendancePercent ?? null,
        deliverableScore: scoreValue(payload.deliverableScore),
        collaborationScore: scoreValue(payload.collaborationScore),
        fieldScore: scoreValue(payload.fieldScore),
        notes: sanitizeText(payload.notes, 4000),
        atRisk: payload.atRisk ?? false,
        riskNotes: sanitizeText(payload.riskNotes, 4000),
      })
      .returning();

    return { review: toDto(row, application) };
  }

  async update(id: string, payload: UpdateFellowshipDeliveryReviewDto) {
    const [existing] = await this.db
      .select()
      .from(fellowshipDeliveryReviews)
      .where(eq(fellowshipDeliveryReviews.id, id))
      .limit(1);
    if (!existing) throw new NotFoundException("Review not found");

    const set: Partial<FellowshipDeliveryReviewRow> = { updatedAt: new Date() };
    if (payload.type !== undefined) set.type = payload.type;
    if (payload.phase !== undefined) set.phase = sanitizeText(payload.phase, 80);
    if (payload.week !== undefined) set.week = payload.week;
    if (payload.reviewerName !== undefined) {
      set.reviewerName = sanitizeText(payload.reviewerName, 120);
    }
    if (payload.reviewerEmail !== undefined) {
      set.reviewerEmail = sanitizeText(payload.reviewerEmail, 200).toLowerCase();
    }
    if (payload.attendancePercent !== undefined) {
      set.attendancePercent = payload.attendancePercent;
    }
    if (payload.deliverableScore !== undefined) {
      set.deliverableScore = payload.deliverableScore;
    }
    if (payload.collaborationScore !== undefined) {
      set.collaborationScore = payload.collaborationScore;
    }
    if (payload.fieldScore !== undefined) set.fieldScore = payload.fieldScore;
    if (payload.notes !== undefined) set.notes = sanitizeText(payload.notes, 4000);
    if (payload.atRisk !== undefined) set.atRisk = payload.atRisk;
    if (payload.riskNotes !== undefined) {
      set.riskNotes = sanitizeText(payload.riskNotes, 4000);
    }

    const [row] = await this.db
      .update(fellowshipDeliveryReviews)
      .set(set)
      .where(eq(fellowshipDeliveryReviews.id, id))
      .returning();
    const application = await this.application(row.applicationId);
    return { review: toDto(row, application) };
  }

  async remove(id: string) {
    const [row] = await this.db
      .delete(fellowshipDeliveryReviews)
      .where(eq(fellowshipDeliveryReviews.id, id))
      .returning({ id: fellowshipDeliveryReviews.id });
    if (!row) throw new NotFoundException("Review not found");
    return { ok: true };
  }
}
