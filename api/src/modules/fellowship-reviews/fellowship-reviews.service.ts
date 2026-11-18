import { randomBytes } from "node:crypto";
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { and, desc, eq, inArray } from "drizzle-orm";

import { sanitizeText } from "@/_shared/text";
import { uuid } from "@/_shared/team-helpers";
import { DATABASE } from "@/db/drizzle/drizzle.module";
import type { Database } from "@/db/drizzle/drizzle.client";
import {
  fellowshipApplicationReviews,
  fellowshipApplications,
  type FellowshipApplicationReviewRow,
  type FellowshipApplicationRow,
} from "@/db/drizzle/schema";
import type {
  AssignFellowshipReviewDto,
  FellowshipReviewScorecardDto,
} from "@/modules/fellowship-reviews/dto/fellowship-review.dto";

export type FellowshipReviewDto = {
  id: string;
  applicationId: string;
  reference: string;
  candidateName: string;
  candidateEmail: string;
  track: string;
  cohort: string;
  reviewerName: string;
  reviewerEmail: string;
  role: string;
  token: string;
  motivationScore: number | null;
  commitmentScore: number | null;
  communicationScore: number | null;
  problemScore: number | null;
  fieldScore: number | null;
  fitScore: number | null;
  recommendation: string;
  notes: string;
  average: number | null;
  tokenExpiresAt: string | null;
  revokedAt: string | null;
  submittedAt: string | null;
  createdAt: string;
};

const token = (): string => randomBytes(24).toString("hex");

const averageOf = (row: FellowshipApplicationReviewRow): number | null => {
  const values = [
    row.motivationScore,
    row.commitmentScore,
    row.communicationScore,
    row.problemScore,
    row.fieldScore,
    row.fitScore,
  ].filter((value): value is number => typeof value === "number");
  if (!values.length) return null;
  return Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(2));
};

const toDto = (
  row: FellowshipApplicationReviewRow,
  application: FellowshipApplicationRow,
): FellowshipReviewDto => ({
  id: row.id,
  applicationId: row.applicationId,
  reference: application.reference,
  candidateName: application.name,
  candidateEmail: application.email,
  track: application.track,
  cohort: application.cohort,
  reviewerName: row.reviewerName,
  reviewerEmail: row.reviewerEmail,
  role: row.role,
  token: row.token,
  motivationScore: row.motivationScore,
  commitmentScore: row.commitmentScore,
  communicationScore: row.communicationScore,
  problemScore: row.problemScore,
  fieldScore: row.fieldScore,
  fitScore: row.fitScore,
  recommendation: row.recommendation ?? "",
  notes: row.notes ?? "",
  average: averageOf(row),
  tokenExpiresAt: row.tokenExpiresAt ? row.tokenExpiresAt.toISOString() : null,
  revokedAt: row.revokedAt ? row.revokedAt.toISOString() : null,
  submittedAt: row.submittedAt ? row.submittedAt.toISOString() : null,
  createdAt: row.createdAt.toISOString(),
});

@Injectable()
export class FellowshipReviewsService {
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

  async list(options: { applicationId?: string } = {}) {
    const rows = await this.db
      .select()
      .from(fellowshipApplicationReviews)
      .where(
        options.applicationId
          ? eq(fellowshipApplicationReviews.applicationId, options.applicationId)
          : undefined,
      )
      .orderBy(desc(fellowshipApplicationReviews.createdAt));

    const applicationIds = Array.from(new Set(rows.map((row) => row.applicationId)));
    const applications = applicationIds.length
      ? await this.db
          .select()
          .from(fellowshipApplications)
          .where(inArray(fellowshipApplications.id, applicationIds))
      : [];
    const byId = new Map(applications.map((application) => [application.id, application]));

    const reviews = rows
      .map((row) => {
        const application = byId.get(row.applicationId);
        return application ? toDto(row, application) : null;
      })
      .filter((entry): entry is FellowshipReviewDto => Boolean(entry));

    const submitted = reviews.filter((review) => review.submittedAt);
    const averages = submitted
      .map((review) => review.average)
      .filter((value): value is number => typeof value === "number");

    return {
      reviews,
      summary: {
        assigned: reviews.length,
        submitted: submitted.length,
        average: averages.length
          ? Number((averages.reduce((sum, value) => sum + value, 0) / averages.length).toFixed(2))
          : null,
      },
      applications,
    };
  }

  async assign(payload: AssignFellowshipReviewDto) {
    const application = await this.application(payload.applicationId);
    const reviewerName = sanitizeText(payload.reviewerName, 120);
    const reviewerEmail = sanitizeText(payload.reviewerEmail, 200).toLowerCase();
    if (!reviewerName || !reviewerEmail) {
      throw new BadRequestException("Reviewer name and email are required");
    }

    const [existing] = await this.db
      .select()
      .from(fellowshipApplicationReviews)
      .where(
        and(
          eq(fellowshipApplicationReviews.applicationId, application.id),
          eq(fellowshipApplicationReviews.reviewerEmail, reviewerEmail),
          eq(fellowshipApplicationReviews.role, "reviewer"),
        ),
      )
      .limit(1);

    if (existing && !existing.revokedAt) {
      throw new BadRequestException("That reviewer is already assigned");
    }

    const [row] = await this.db
      .insert(fellowshipApplicationReviews)
      .values({
        id: uuid(),
        applicationId: application.id,
        reviewerName,
        reviewerEmail,
        role: "reviewer",
        token: token(),
        tokenExpiresAt: new Date(
          Date.now() + (payload.expiresInDays ?? 14) * 24 * 60 * 60 * 1000,
        ),
      })
      .returning();

    return toDto(row, application);
  }

  async revoke(id: string) {
    const [row] = await this.db
      .update(fellowshipApplicationReviews)
      .set({ revokedAt: new Date() })
      .where(eq(fellowshipApplicationReviews.id, id))
      .returning();
    if (!row) throw new NotFoundException("Review not found");
    return { ok: true };
  }

  async remove(id: string) {
    const [row] = await this.db
      .delete(fellowshipApplicationReviews)
      .where(eq(fellowshipApplicationReviews.id, id))
      .returning({ id: fellowshipApplicationReviews.id });
    if (!row) throw new NotFoundException("Review not found");
    return { ok: true };
  }

  private active(row: FellowshipApplicationReviewRow): void {
    if (row.revokedAt) throw new NotFoundException("Review link is no longer active");
    if (row.tokenExpiresAt && row.tokenExpiresAt.getTime() < Date.now()) {
      throw new NotFoundException("Review link has expired");
    }
  }

  async findByToken(rawToken: string) {
    const [row] = await this.db
      .select()
      .from(fellowshipApplicationReviews)
      .where(eq(fellowshipApplicationReviews.token, rawToken))
      .limit(1);
    if (!row) throw new NotFoundException("Review not found");
    this.active(row);

    const application = await this.application(row.applicationId);
    return {
      review: toDto(row, application),
      application: {
        reference: application.reference,
        name: application.name,
        email: application.email,
        city: application.city,
        candidateStatus: application.candidateStatus,
        track: application.track,
        motivation: application.motivation,
        cohort: application.cohort,
      },
    };
  }

  async submitByToken(rawToken: string, payload: FellowshipReviewScorecardDto) {
    const [row] = await this.db
      .select()
      .from(fellowshipApplicationReviews)
      .where(eq(fellowshipApplicationReviews.token, rawToken))
      .limit(1);
    if (!row) throw new NotFoundException("Review not found");
    this.active(row);
    return this.score(row.id, payload);
  }

  async submitAsAdmin(
    applicationId: string,
    user: { name?: string | null; email: string },
    payload: FellowshipReviewScorecardDto,
  ) {
    await this.application(applicationId);
    const email = user.email.toLowerCase();
    let [row] = await this.db
      .select()
      .from(fellowshipApplicationReviews)
      .where(
        and(
          eq(fellowshipApplicationReviews.applicationId, applicationId),
          eq(fellowshipApplicationReviews.reviewerEmail, email),
        ),
      )
      .limit(1);

    if (!row) {
      [row] = await this.db
        .insert(fellowshipApplicationReviews)
        .values({
          id: uuid(),
          applicationId,
          reviewerName: user.name || email,
          reviewerEmail: email,
          role: "admin",
          token: token(),
        })
        .returning();
    }

    return this.score(row.id, payload);
  }

  private async score(id: string, payload: FellowshipReviewScorecardDto) {
    const [row] = await this.db
      .update(fellowshipApplicationReviews)
      .set({
        motivationScore: payload.motivationScore,
        commitmentScore: payload.commitmentScore,
        communicationScore: payload.communicationScore,
        problemScore: payload.problemScore,
        fieldScore: payload.fieldScore,
        fitScore: payload.fitScore,
        recommendation: payload.recommendation,
        notes: sanitizeText(payload.notes, 4000),
        submittedAt: new Date(),
      })
      .where(eq(fellowshipApplicationReviews.id, id))
      .returning();
    if (!row) throw new NotFoundException("Review not found");

    const application = await this.application(row.applicationId);
    return { review: toDto(row, application) };
  }
}
