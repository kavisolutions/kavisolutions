import { randomBytes } from "node:crypto";
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { and, desc, eq, inArray, isNull } from "drizzle-orm";

import { sanitizeText } from "@/_shared/text";
import { uuid } from "@/_shared/team-helpers";
import { DATABASE } from "@/db/drizzle/drizzle.module";
import type { Database } from "@/db/drizzle/drizzle.client";
import {
  fellowshipApplications,
  fellowshipInterviewPanel,
  fellowshipInterviews,
  fellowshipMentors,
  type FellowshipApplicationRow,
  type FellowshipInterviewPanelRow,
  type FellowshipInterviewRow,
} from "@/db/drizzle/schema";
import type {
  CreateFellowshipInterviewDto,
  FellowshipPanelTokenDto,
  FellowshipRescheduleRequestDto,
  FellowshipScorecardDto,
  UpdateFellowshipInterviewDto,
  UpdateFellowshipInterviewPanelDto,
} from "@/modules/fellowship-interviews/dto/fellowship-interview.dto";

export type FellowshipPanelDto = {
  id: string;
  name: string;
  email: string;
  role: string;
  token: string;
  submittedAt: string | null;
  mentorId: string | null;
  portalToken: string | null;
  tokenExpiresAt: string | null;
  revokedAt: string | null;
  lastSentAt: string | null;
  motivationScore: number | null;
  commitmentScore: number | null;
  communicationScore: number | null;
  problemScore: number | null;
  fieldScore: number | null;
  fitScore: number | null;
  recommendation: string;
  notes: string;
  average: number | null;
};

export type FellowshipInterviewDto = {
  id: string;
  applicationId: string;
  reference: string;
  candidateName: string;
  candidateEmail: string;
  track: string;
  cohort: string;
  scheduledAt: string;
  mode: string;
  location: string;
  meetingUrl: string;
  status: string;
  candidateToken: string;
  candidateConfirmedAt: string | null;
  rescheduleRequestedAt: string | null;
  rescheduleNote: string;
  reminderSentAt: string | null;
  panel: FellowshipPanelDto[];
  average: number | null;
};

const token = (): string => randomBytes(24).toString("hex");

const scoreAverage = (row: FellowshipInterviewPanelRow): number | null => {
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

const toPanel = (
  row: FellowshipInterviewPanelRow,
  portalToken: string | null = null,
): FellowshipPanelDto => ({
  id: row.id,
  name: row.name,
  email: row.email,
  role: row.role,
  token: row.token,
  submittedAt: row.submittedAt ? row.submittedAt.toISOString() : null,
  mentorId: row.mentorId ?? null,
  portalToken,
  tokenExpiresAt: row.tokenExpiresAt ? row.tokenExpiresAt.toISOString() : null,
  revokedAt: row.revokedAt ? row.revokedAt.toISOString() : null,
  lastSentAt: row.lastSentAt ? row.lastSentAt.toISOString() : null,
  motivationScore: row.motivationScore,
  commitmentScore: row.commitmentScore,
  communicationScore: row.communicationScore,
  problemScore: row.problemScore,
  fieldScore: row.fieldScore,
  fitScore: row.fitScore,
  recommendation: row.recommendation ?? "",
  notes: row.notes ?? "",
  average: scoreAverage(row),
});

@Injectable()
export class FellowshipInterviewsService {
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

  private async toDto(
    row: FellowshipInterviewRow,
    application: FellowshipApplicationRow,
  ): Promise<FellowshipInterviewDto> {
    const panelRows = await this.db
      .select()
      .from(fellowshipInterviewPanel)
      .where(eq(fellowshipInterviewPanel.interviewId, row.id))
      .orderBy(fellowshipInterviewPanel.createdAt);

    const panel = panelRows.map((row) => toPanel(row));
    const mentorIds = panelRows
      .map((row) => row.mentorId)
      .filter((value): value is string => Boolean(value));
    if (mentorIds.length) {
      const mentors = await this.db
        .select({
          id: fellowshipMentors.id,
          portalToken: fellowshipMentors.portalToken,
        })
        .from(fellowshipMentors)
        .where(inArray(fellowshipMentors.id, mentorIds));
      const portalById = new Map(
        mentors.map((mentor) => [mentor.id, mentor.portalToken ?? null]),
      );
      for (const entry of panel) {
        const row = panelRows.find((candidate) => candidate.id === entry.id);
        if (row?.mentorId) entry.portalToken = portalById.get(row.mentorId) ?? null;
      }
    }
    const averages = panel
      .map((entry) => entry.average)
      .filter((value): value is number => typeof value === "number");

    return {
      id: row.id,
      applicationId: row.applicationId,
      reference: application.reference,
      candidateName: application.name,
      candidateEmail: application.email,
      track: application.track,
      cohort: application.cohort,
      scheduledAt: row.scheduledAt.toISOString(),
      mode: row.mode,
      location: row.location ?? "",
      meetingUrl: row.meetingUrl ?? "",
      status: row.status,
      candidateToken: row.candidateToken ?? "",
      candidateConfirmedAt: row.candidateConfirmedAt
        ? row.candidateConfirmedAt.toISOString()
        : null,
      rescheduleRequestedAt: row.rescheduleRequestedAt
        ? row.rescheduleRequestedAt.toISOString()
        : null,
      rescheduleNote: row.rescheduleNote ?? "",
      reminderSentAt: row.reminderSentAt
        ? row.reminderSentAt.toISOString()
        : null,
      panel,
      average: averages.length
        ? Number((averages.reduce((sum, value) => sum + value, 0) / averages.length).toFixed(2))
        : null,
    };
  }

  async list(options: { applicationId?: string } = {}) {
    const rows = await this.db
      .select()
      .from(fellowshipInterviews)
      .where(
        options.applicationId
          ? eq(fellowshipInterviews.applicationId, options.applicationId)
          : undefined,
      )
      .orderBy(desc(fellowshipInterviews.scheduledAt));

    const applications = rows.length
      ? await this.db
          .select()
          .from(fellowshipApplications)
          .where(inArray(fellowshipApplications.id, rows.map((row) => row.applicationId)))
      : [];
    const byId = new Map(applications.map((application) => [application.id, application]));

    const interviews = await Promise.all(
      rows.map((row) => {
        const application = byId.get(row.applicationId);
        if (!application) return null;
        return this.toDto(row, application);
      }),
    );

    return { interviews: interviews.filter((item): item is FellowshipInterviewDto => Boolean(item)) };
  }

  async create(payload: CreateFellowshipInterviewDto) {
    const application = await this.application(payload.applicationId);
    const mentorIds = Array.from(new Set(payload.mentorIds ?? []));
    const adminEmails = Array.from(
      new Set((payload.adminEmails ?? []).map((email) => sanitizeText(email, 200).toLowerCase())),
    );

    const mentors = mentorIds.length
      ? await this.db
          .select()
          .from(fellowshipMentors)
          .where(inArray(fellowshipMentors.id, mentorIds))
      : [];

    if (mentors.length !== mentorIds.length) {
      throw new BadRequestException("One or more mentors were not found");
    }

    if (!mentors.length && !adminEmails.length) {
      throw new BadRequestException("Add at least one interviewer to the panel");
    }

    const scheduledAt = new Date(payload.scheduledAt);
    if (Number.isNaN(scheduledAt.getTime())) {
      throw new BadRequestException("Invalid interview date");
    }

    const [interview] = await this.db
      .insert(fellowshipInterviews)
      .values({
        id: uuid(),
        applicationId: application.id,
        scheduledAt,
        mode: payload.mode,
        location: sanitizeText(payload.location, 300),
        meetingUrl: sanitizeText(payload.meetingUrl, 500),
        status: "scheduled",
        candidateToken: token(),
      })
      .returning();

    const tokenExpiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
    const panelValues: Array<typeof fellowshipInterviewPanel.$inferInsert> = [
      ...mentors.map((mentor) => ({
        id: uuid(),
        interviewId: interview.id,
        mentorId: mentor.id,
        name: mentor.name,
        email: mentor.email,
        role: "mentor",
        token: token(),
        tokenExpiresAt,
      })),
      ...adminEmails.map((email) => ({
        id: uuid(),
        interviewId: interview.id,
        mentorId: null,
        name: email,
        email,
        role: "admin",
        token: token(),
        tokenExpiresAt,
      })),
    ];

    await this.db.insert(fellowshipInterviewPanel).values(panelValues);

    if (["applied", "review", "waitlisted"].includes(application.stage)) {
      await this.db
        .update(fellowshipApplications)
        .set({ stage: "interview", updatedAt: new Date() })
        .where(eq(fellowshipApplications.id, application.id));
    }

    return this.toDto(interview, application);
  }

  async update(id: string, payload: UpdateFellowshipInterviewDto) {
    const [existing] = await this.db
      .select()
      .from(fellowshipInterviews)
      .where(eq(fellowshipInterviews.id, id))
      .limit(1);
    if (!existing) throw new NotFoundException("Interview not found");

    const set: Partial<FellowshipInterviewRow> = { updatedAt: new Date() };
    if (payload.scheduledAt !== undefined) {
      const date = new Date(payload.scheduledAt);
      if (Number.isNaN(date.getTime())) throw new BadRequestException("Invalid date");
      set.scheduledAt = date;
      set.reminderSentAt = null;
      set.candidateConfirmedAt = null;
      set.rescheduleRequestedAt = null;
      set.rescheduleNote = "";
    }
    if (payload.mode !== undefined) set.mode = payload.mode;
    if (payload.location !== undefined) set.location = sanitizeText(payload.location, 300);
    if (payload.meetingUrl !== undefined) set.meetingUrl = sanitizeText(payload.meetingUrl, 500);
    if (payload.status !== undefined) set.status = payload.status;

    const [row] = await this.db
      .update(fellowshipInterviews)
      .set(set)
      .where(eq(fellowshipInterviews.id, id))
      .returning();

    const application = await this.application(row.applicationId);
    return this.toDto(row, application);
  }

  private async scorePanel(
    panel: FellowshipInterviewPanelRow,
    payload: FellowshipScorecardDto,
  ) {
    await this.db
      .update(fellowshipInterviewPanel)
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
      .where(eq(fellowshipInterviewPanel.id, panel.id));

    const peers = await this.db
      .select({ submittedAt: fellowshipInterviewPanel.submittedAt })
      .from(fellowshipInterviewPanel)
      .where(
        and(
          eq(fellowshipInterviewPanel.interviewId, panel.interviewId),
          isNull(fellowshipInterviewPanel.revokedAt),
        ),
      );
    const complete =
      peers.length > 0 && peers.every((peer) => Boolean(peer.submittedAt));

    if (complete) {
      await this.db
        .update(fellowshipInterviews)
        .set({ status: "completed", updatedAt: new Date() })
        .where(eq(fellowshipInterviews.id, panel.interviewId));
    }

    return { completed: complete };
  }

  private activePanel(panel: FellowshipInterviewPanelRow): void {
    if (panel.revokedAt) throw new NotFoundException("Scorecard link is no longer active");
    if (panel.tokenExpiresAt && panel.tokenExpiresAt.getTime() < Date.now()) {
      throw new NotFoundException("Scorecard link has expired");
    }
  }

  async findByToken(rawToken: string) {
    const [panel] = await this.db
      .select()
      .from(fellowshipInterviewPanel)
      .where(eq(fellowshipInterviewPanel.token, rawToken))
      .limit(1);
    if (!panel) throw new NotFoundException("Scorecard not found");
    this.activePanel(panel);

    const [interview] = await this.db
      .select()
      .from(fellowshipInterviews)
      .where(eq(fellowshipInterviews.id, panel.interviewId))
      .limit(1);
    if (!interview) throw new NotFoundException("Interview not found");

    const application = await this.application(interview.applicationId);
    const dto = await this.toDto(interview, application);
    const currentPanel = dto.panel.find((entry) => entry.id === panel.id);

    return {
      interview: {
        ...dto,
        panel: undefined,
        candidateToken: undefined,
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
      },
      scorecard: currentPanel,
    };
  }

  async submitByToken(rawToken: string, payload: FellowshipScorecardDto) {
    const [panel] = await this.db
      .select()
      .from(fellowshipInterviewPanel)
      .where(eq(fellowshipInterviewPanel.token, rawToken))
      .limit(1);
    if (!panel) throw new NotFoundException("Scorecard not found");
    this.activePanel(panel);
    return this.scorePanel(panel, payload);
  }

  async submitAsAdmin(
    interviewId: string,
    user: { name?: string | null; email: string },
    payload: FellowshipScorecardDto,
  ) {
    const [interview] = await this.db
      .select()
      .from(fellowshipInterviews)
      .where(eq(fellowshipInterviews.id, interviewId))
      .limit(1);
    if (!interview) throw new NotFoundException("Interview not found");

    const email = user.email.toLowerCase();
    let [panel] = await this.db
      .select()
      .from(fellowshipInterviewPanel)
      .where(
        and(
          eq(fellowshipInterviewPanel.interviewId, interviewId),
          eq(fellowshipInterviewPanel.email, email),
        ),
      )
      .limit(1);

    if (!panel) {
      [panel] = await this.db
        .insert(fellowshipInterviewPanel)
        .values({
          id: uuid(),
          interviewId,
          mentorId: null,
          name: user.name || email,
          email,
          role: "admin",
          token: token(),
        })
        .returning();
    }

    return this.scorePanel(panel, payload);
  }

  async updatePanel(id: string, payload: UpdateFellowshipInterviewPanelDto) {
    const [interview] = await this.db
      .select()
      .from(fellowshipInterviews)
      .where(eq(fellowshipInterviews.id, id))
      .limit(1);
    if (!interview) throw new NotFoundException("Interview not found");

    const mentorIds = Array.from(new Set(payload.mentorIds ?? []));
    const adminEmails = Array.from(
      new Set(
        (payload.adminEmails ?? []).map((email) =>
          sanitizeText(email, 200).toLowerCase(),
        ),
      ),
    );
    if (!mentorIds.length && !adminEmails.length) {
      throw new BadRequestException("Add at least one interviewer to the panel");
    }

    const mentors = mentorIds.length
      ? await this.db
          .select()
          .from(fellowshipMentors)
          .where(inArray(fellowshipMentors.id, mentorIds))
      : [];
    if (mentors.length !== mentorIds.length) {
      throw new BadRequestException("One or more mentors were not found");
    }

    const existing = await this.db
      .select()
      .from(fellowshipInterviewPanel)
      .where(eq(fellowshipInterviewPanel.interviewId, id));
    const keyOf = (row: FellowshipInterviewPanelRow): string =>
      row.mentorId ? `mentor:${row.mentorId}` : `admin:${row.email.toLowerCase()}`;
    const desired = new Set([
      ...mentors.map((mentor) => `mentor:${mentor.id}`),
      ...adminEmails.map((email) => `admin:${email}`),
    ]);
    const existingKeys = new Set(existing.map(keyOf));

    const remove = existing.filter((row) => !desired.has(keyOf(row)));
    if (remove.some((row) => row.submittedAt)) {
      throw new BadRequestException(
        "A panelist who submitted a scorecard cannot be removed",
      );
    }
    if (remove.length) {
      await this.db.delete(fellowshipInterviewPanel).where(
        inArray(
          fellowshipInterviewPanel.id,
          remove.map((row) => row.id),
        ),
      );
    }

    const tokenExpiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
    const additions: Array<typeof fellowshipInterviewPanel.$inferInsert> = [
      ...mentors
        .filter((mentor) => !existingKeys.has(`mentor:${mentor.id}`))
        .map((mentor) => ({
          id: uuid(),
          interviewId: id,
          mentorId: mentor.id,
          name: mentor.name,
          email: mentor.email,
          role: "mentor",
          token: token(),
          tokenExpiresAt,
        })),
      ...adminEmails
        .filter((email) => !existingKeys.has(`admin:${email}`))
        .map((email) => ({
          id: uuid(),
          interviewId: id,
          mentorId: null,
          name: email,
          email,
          role: "admin",
          token: token(),
          tokenExpiresAt,
        })),
    ];

    const added = additions.length
      ? await this.db.insert(fellowshipInterviewPanel).values(additions).returning()
      : [];

    const application = await this.application(interview.applicationId);
    return {
      interview: await this.toDto(interview, application),
      addedPanel: added.map((row) => toPanel(row)),
    };
  }

  async rotatePanelToken(panelId: string, payload: FellowshipPanelTokenDto = {}) {
    const [panel] = await this.db
      .select()
      .from(fellowshipInterviewPanel)
      .where(eq(fellowshipInterviewPanel.id, panelId))
      .limit(1);
    if (!panel) throw new NotFoundException("Panelist not found");

    const [updated] = await this.db
      .update(fellowshipInterviewPanel)
      .set({
        token: token(),
        tokenExpiresAt: new Date(
          Date.now() + (payload.expiresInDays ?? 14) * 24 * 60 * 60 * 1000,
        ),
        revokedAt: null,
        lastSentAt: null,
      })
      .where(eq(fellowshipInterviewPanel.id, panelId))
      .returning();

    return { panel: toPanel(updated) };
  }

  async revokePanelToken(panelId: string) {
    const [updated] = await this.db
      .update(fellowshipInterviewPanel)
      .set({ revokedAt: new Date() })
      .where(eq(fellowshipInterviewPanel.id, panelId))
      .returning();
    if (!updated) throw new NotFoundException("Panelist not found");
    return { panel: toPanel(updated) };
  }

  async markPanelSent(panelId: string) {
    await this.db
      .update(fellowshipInterviewPanel)
      .set({ lastSentAt: new Date() })
      .where(eq(fellowshipInterviewPanel.id, panelId));
  }

  async panelDetail(panelId: string) {
    const [panel] = await this.db
      .select()
      .from(fellowshipInterviewPanel)
      .where(eq(fellowshipInterviewPanel.id, panelId))
      .limit(1);
    if (!panel) throw new NotFoundException("Panelist not found");
    const [interview] = await this.db
      .select()
      .from(fellowshipInterviews)
      .where(eq(fellowshipInterviews.id, panel.interviewId))
      .limit(1);
    if (!interview) throw new NotFoundException("Interview not found");
    const application = await this.application(interview.applicationId);
    const dto = await this.toDto(interview, application);
    return {
      interview: dto,
      panel: dto.panel.find((entry) => entry.id === panelId) ?? null,
    };
  }

  private async interviewByCandidateToken(rawToken: string) {
    const raw = sanitizeText(rawToken, 80);
    const [interview] = await this.db
      .select()
      .from(fellowshipInterviews)
      .where(eq(fellowshipInterviews.candidateToken, raw))
      .limit(1);
    if (!interview) throw new NotFoundException("Interview not found");
    const application = await this.application(interview.applicationId);
    return { interview, application };
  }

  async findByCandidateToken(rawToken: string) {
    const { interview, application } = await this.interviewByCandidateToken(rawToken);
    const dto = await this.toDto(interview, application);

    return {
      interview: {
        reference: dto.reference,
        candidateName: dto.candidateName,
        track: dto.track,
        cohort: dto.cohort,
        scheduledAt: dto.scheduledAt,
        mode: dto.mode,
        location: dto.location,
        meetingUrl: dto.meetingUrl,
        status: dto.status,
        candidateConfirmedAt: dto.candidateConfirmedAt,
        rescheduleRequestedAt: dto.rescheduleRequestedAt,
        rescheduleNote: dto.rescheduleNote,
        panel: dto.panel.map((member) => ({
          name: member.name,
          role: member.role,
        })),
      },
    };
  }

  async confirmCandidate(rawToken: string) {
    const { interview } = await this.interviewByCandidateToken(rawToken);
    const [updated] = await this.db
      .update(fellowshipInterviews)
      .set({ candidateConfirmedAt: new Date(), updatedAt: new Date() })
      .where(eq(fellowshipInterviews.id, interview.id))
      .returning();
    return {
      ok: true,
      confirmedAt: updated.candidateConfirmedAt?.toISOString() ?? null,
    };
  }

  async requestReschedule(
    rawToken: string,
    payload: FellowshipRescheduleRequestDto,
  ) {
    const { interview } = await this.interviewByCandidateToken(rawToken);
    const [updated] = await this.db
      .update(fellowshipInterviews)
      .set({
        rescheduleRequestedAt: new Date(),
        rescheduleNote: sanitizeText(payload.note, 1000),
        updatedAt: new Date(),
      })
      .where(eq(fellowshipInterviews.id, interview.id))
      .returning();
    return {
      ok: true,
      requestedAt: updated.rescheduleRequestedAt?.toISOString() ?? null,
    };
  }

  async upcomingReminders(hours = 48) {
    const now = Date.now();
    const until = now + hours * 60 * 60 * 1000;
    const rows = await this.db
      .select()
      .from(fellowshipInterviews)
      .where(eq(fellowshipInterviews.status, "scheduled"))
      .orderBy(fellowshipInterviews.scheduledAt);
    const due = rows.filter(
      (row) =>
        row.scheduledAt.getTime() >= now &&
        row.scheduledAt.getTime() <= until &&
        !row.reminderSentAt,
    );

    const applications = due.length
      ? await this.db
          .select()
          .from(fellowshipApplications)
          .where(
            inArray(
              fellowshipApplications.id,
              due.map((row) => row.applicationId),
            ),
          )
      : [];
    const byId = new Map(applications.map((application) => [application.id, application]));

    const interviews = await Promise.all(
      due.map(async (row) => {
        const application = byId.get(row.applicationId);
        return application ? this.toDto(row, application) : null;
      }),
    );

    return {
      interviews: interviews.filter(
        (entry): entry is FellowshipInterviewDto => Boolean(entry),
      ),
    };
  }

  async markReminderSent(id: string) {
    await this.db
      .update(fellowshipInterviews)
      .set({ reminderSentAt: new Date(), updatedAt: new Date() })
      .where(eq(fellowshipInterviews.id, id));
    return { ok: true };
  }
}
