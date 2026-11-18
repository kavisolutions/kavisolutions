import { Inject, Injectable } from "@nestjs/common";


import { DATABASE } from "@/db/drizzle/drizzle.module";
import type { Database } from "@/db/drizzle/drizzle.client";
import {
  fellowshipAlumni,
  fellowshipApplicationReviews,
  fellowshipApplications,
  fellowshipCases,
  fellowshipDeliveryReviews,
  fellowshipInterviews,
} from "@/db/drizzle/schema";

@Injectable()
export class FellowshipOperationsService {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async dashboard() {
    const now = Date.now();
    const [applications, interviews, reviews, delivery, cases, alumni] =
      await Promise.all([
        this.db.select().from(fellowshipApplications),
        this.db.select().from(fellowshipInterviews),
        this.db.select().from(fellowshipApplicationReviews),
        this.db.select().from(fellowshipDeliveryReviews),
        this.db.select().from(fellowshipCases),
        this.db.select().from(fellowshipAlumni),
      ]);

    const stages: Record<string, number> = {};
    for (const application of applications) {
      stages[application.stage] = (stages[application.stage] ?? 0) + 1;
    }

    const interviewsScheduled = interviews.filter(
      (interview) => interview.status === "scheduled",
    );
    const upcoming = interviewsScheduled.filter(
      (interview) => interview.scheduledAt.getTime() >= now,
    );
    const nextSevenDays = upcoming.filter(
      (interview) =>
        interview.scheduledAt.getTime() <= now + 7 * 24 * 60 * 60 * 1000,
    );
    const offersExpiring = applications.filter(
      (application) =>
        application.stage === "offer" &&
        application.offerExpiresAt &&
        application.offerExpiresAt.getTime() >= now &&
        application.offerExpiresAt.getTime() <= now + 72 * 60 * 60 * 1000,
    );
    const waitlisted = applications.filter(
      (application) => application.stage === "waitlisted",
    );
    const pendingReviews = reviews.filter(
      (review) => !review.submittedAt && !review.revokedAt,
    );
    const atRisk = delivery.filter((review) => review.atRisk);
    const openCases = cases.filter(
      (entry) => entry.status === "open" || entry.status === "investigating",
    );

    const total = applications.length;
    const rate = (value: number): number =>
      total ? Number(((value / total) * 100).toFixed(1)) : 0;

    const destinations: Record<string, number> = {};
    for (const record of alumni) {
      const key = record.destinationType || "unknown";
      destinations[key] = (destinations[key] ?? 0) + 1;
    }

    return {
      applications: {
        total,
        stages,
        interviewRate: rate(
          (stages.interview ?? 0) +
            (stages.waitlisted ?? 0) +
            (stages.offer ?? 0) +
            (stages.accepted ?? 0) +
            (stages.onboarded ?? 0) +
            (stages.active ?? 0) +
            (stages.completed ?? 0),
        ),
        offerRate: rate(
          (stages.offer ?? 0) +
            (stages.accepted ?? 0) +
            (stages.onboarded ?? 0) +
            (stages.active ?? 0) +
            (stages.completed ?? 0),
        ),
        completionRate: rate(stages.completed ?? 0),
      },
      interviews: {
        scheduled: interviewsScheduled.length,
        upcoming: upcoming.length,
        nextSevenDays: nextSevenDays.length,
        completed: interviews.filter((interview) => interview.status === "completed")
          .length,
      },
      reviews: { pending: pendingReviews.length, assigned: reviews.length },
      delivery: { atRisk: atRisk.length },
      cases: { open: openCases.length },
      offers: { expiringSoon: offersExpiring.length },
      waitlist: { active: waitlisted.length },
      alumni: {
        total: alumni.length,
        mentorWilling: alumni.filter((record) => record.mentorWilling).length,
        published: alumni.filter((record) => record.storyPublished).length,
        destinations,
      },
    };
  }

  async cohorts() {
    const [applications, alumni] = await Promise.all([
      this.db.select().from(fellowshipApplications),
      this.db.select().from(fellowshipAlumni),
    ]);
    const byCohort = new Map<string, { applications: number; alumni: number }>();
    for (const application of applications) {
      const key = application.cohort || "Unassigned";
      const current = byCohort.get(key) ?? { applications: 0, alumni: 0 };
      current.applications += 1;
      byCohort.set(key, current);
    }
    for (const record of alumni) {
      const key = record.cohort || "Unassigned";
      const current = byCohort.get(key) ?? { applications: 0, alumni: 0 };
      current.alumni += 1;
      byCohort.set(key, current);
    }
    return {
      cohorts: Array.from(byCohort.entries())
        .map(([cohort, counts]) => ({ cohort, ...counts }))
        .sort((left, right) => right.applications - left.applications),
    };
  }
}
