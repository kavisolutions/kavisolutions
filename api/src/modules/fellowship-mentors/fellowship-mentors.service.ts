import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { desc, eq, inArray, or } from "drizzle-orm";

import { sanitizeText } from "@/_shared/text";
import { uuid } from "@/_shared/team-helpers";
import { DATABASE } from "@/db/drizzle/drizzle.module";
import type { Database } from "@/db/drizzle/drizzle.client";
import {
  fellowshipApplications,
  fellowshipInterviewPanel,
  fellowshipInterviews,
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
  portalToken: string;
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
  portalToken: row.portalToken ?? "",
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
        portalToken: uuid().replace(/-/g, ""),
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
    if (!existing.portalToken) set.portalToken = uuid().replace(/-/g, "");
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

  async rotatePortalToken(id: string) {
    const [row] = await this.db
      .update(fellowshipMentors)
      .set({
        portalToken: uuid().replace(/-/g, ""),
        updatedAt: new Date(),
      })
      .where(eq(fellowshipMentors.id, id))
      .returning();
    if (!row) throw new NotFoundException("Mentor not found");
    return { mentor: toDto(row) };
  }

  async portal(rawToken: string) {
    const raw = sanitizeText(rawToken, 80);
    const [mentor] = await this.db
      .select()
      .from(fellowshipMentors)
      .where(eq(fellowshipMentors.portalToken, raw))
      .limit(1);
    if (!mentor) throw new NotFoundException("Mentor portal not found");

    const panelRows = await this.db
      .select()
      .from(fellowshipInterviewPanel)
      .where(
        or(
          eq(fellowshipInterviewPanel.mentorId, mentor.id),
          eq(fellowshipInterviewPanel.email, mentor.email),
        ),
      );

    const interviewIds = Array.from(new Set(panelRows.map((row) => row.interviewId)));
    const interviews = interviewIds.length
      ? await this.db
          .select()
          .from(fellowshipInterviews)
          .where(inArray(fellowshipInterviews.id, interviewIds))
      : [];
    const applications = interviews.length
      ? await this.db
          .select()
          .from(fellowshipApplications)
          .where(
            inArray(
              fellowshipApplications.id,
              interviews.map((interview) => interview.applicationId),
            ),
          )
      : [];
    const applicationById = new Map(
      applications.map((application) => [application.id, application]),
    );
    const panelByInterview = new Map(
      panelRows.map((row) => [row.interviewId, row]),
    );

    return {
      mentor: {
        name: mentor.name,
        email: mentor.email,
        title: mentor.title,
        expertise: mentor.expertise,
      },
      assignments: interviews
        .map((interview) => {
          const application = applicationById.get(interview.applicationId);
          const panel = panelByInterview.get(interview.id);
          if (!application || !panel) return null;
          return {
            interviewId: interview.id,
            reference: application.reference,
            candidateName: application.name,
            track: application.track,
            cohort: application.cohort,
            scheduledAt: interview.scheduledAt.toISOString(),
            mode: interview.mode,
            location: interview.location,
            meetingUrl: interview.meetingUrl,
            status: interview.status,
            candidateConfirmedAt: interview.candidateConfirmedAt
              ? interview.candidateConfirmedAt.toISOString()
              : null,
            rescheduleRequestedAt: interview.rescheduleRequestedAt
              ? interview.rescheduleRequestedAt.toISOString()
              : null,
            rescheduleNote: interview.rescheduleNote,
            scorecardToken: panel.token,
            submittedAt: panel.submittedAt ? panel.submittedAt.toISOString() : null,
            tokenRevokedAt: panel.revokedAt ? panel.revokedAt.toISOString() : null,
            tokenExpiresAt: panel.tokenExpiresAt
              ? panel.tokenExpiresAt.toISOString()
              : null,
            myScoreAverage: (() => {
              const values = [
                panel.motivationScore,
                panel.commitmentScore,
                panel.communicationScore,
                panel.problemScore,
                panel.fieldScore,
                panel.fitScore,
              ].filter((value): value is number => typeof value === "number");
              return values.length
                ? Number(
                    (
                      values.reduce((sum, value) => sum + value, 0) / values.length
                    ).toFixed(2),
                  )
                : null;
            })(),
          };
        })
        .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))
        .sort(
          (left, right) =>
            new Date(left.scheduledAt).getTime() - new Date(right.scheduledAt).getTime(),
        ),
    };
  }
}
