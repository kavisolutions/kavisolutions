import {
  Body,
  Controller,
  Get,
  Header,
  Logger,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  UnauthorizedException,
} from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

import {
  buildFellowshipInterviewIcs,
  sendFellowshipInterviewCandidateEmail,
  sendFellowshipInterviewerEmail,
} from "@/_shared/mailer";
import { AdminOnly, Public } from "@/auth/auth.decorators";
import { CurrentUser } from "@/auth/auth.guard";
import type { SessionUser } from "@/auth/auth.types";
import { FellowshipAuditService } from "@/modules/fellowship-audit/fellowship-audit.service";
import {
  CreateFellowshipInterviewDto,
  FellowshipPanelTokenDto,
  FellowshipRescheduleRequestDto,
  FellowshipScorecardDto,
  UpdateFellowshipInterviewDto,
  UpdateFellowshipInterviewPanelDto,
} from "@/modules/fellowship-interviews/dto/fellowship-interview.dto";
import { FellowshipInterviewsService } from "@/modules/fellowship-interviews/fellowship-interviews.service";
import type {
  FellowshipInterviewDto,
  FellowshipPanelDto,
} from "@/modules/fellowship-interviews/fellowship-interviews.service";

@ApiTags("fellowship-interviews")
@Controller("fellowship-interviews")
export class FellowshipInterviewsController {
  private readonly logger = new Logger(FellowshipInterviewsController.name);

  constructor(
    private readonly service: FellowshipInterviewsService,
    private readonly audit: FellowshipAuditService,
  ) {}

  @Get()
  @AdminOnly()
  @ApiBearerAuth()
  async list(@Query("applicationId") applicationId?: string) {
    return this.service.list({ applicationId });
  }

  @Post()
  @AdminOnly()
  @ApiBearerAuth()
  async create(
    @Body() body: CreateFellowshipInterviewDto,
    @CurrentUser() user: SessionUser | null,
  ) {
    const interview = await this.service.create(body);
    const panelNames = interview.panel.map((entry) => entry.name || entry.email);

    try {
      await sendFellowshipInterviewCandidateEmail({
        reference: interview.reference,
        candidateName: interview.candidateName,
        candidateEmail: interview.candidateEmail,
        scheduledAt: interview.scheduledAt,
        mode: interview.mode,
        location: interview.location,
        meetingUrl: interview.meetingUrl,
        interviewers: panelNames,
        kind: "scheduled",
        candidateToken: interview.candidateToken,
      });

      await Promise.all(
        interview.panel.map((entry) =>
          sendFellowshipInterviewerEmail({
            name: entry.name || entry.email,
            email: entry.email,
            candidateName: interview.candidateName,
            reference: interview.reference,
            track: interview.track,
            scheduledAt: interview.scheduledAt,
            mode: interview.mode,
            location: interview.location,
            meetingUrl: interview.meetingUrl,
            token: entry.token,
            portalToken: entry.portalToken,
          }),
        ),
      );
    } catch (error) {
      // The interview is stored; only the invitations failed.
      this.logger.error(
        `Fellowship interview mail failed for ${interview.reference}: ${
          error instanceof Error ? error.message : "unknown error"
        }`,
      );
    }

    await this.audit.log({
      actorEmail: user?.email,
      action: "interview.created",
      entityType: "interview",
      entityId: interview.id,
      applicationId: interview.applicationId,
      detail: interview.scheduledAt,
    });

    return { interview };
  }

  @Patch(":id")
  @AdminOnly()
  @ApiBearerAuth()
  async update(
    @Param("id") id: string,
    @Body() body: UpdateFellowshipInterviewDto,
    @CurrentUser() user: SessionUser | null,
  ) {
    const interview = await this.service.update(id, body);
    const scheduleChanged =
      body.scheduledAt !== undefined ||
      body.mode !== undefined ||
      body.location !== undefined ||
      body.meetingUrl !== undefined;
    const cancelled = body.status === "cancelled";

    if (scheduleChanged || cancelled) {
      try {
        await sendFellowshipInterviewCandidateEmail({
          reference: interview.reference,
          candidateName: interview.candidateName,
          candidateEmail: interview.candidateEmail,
          scheduledAt: interview.scheduledAt,
          mode: interview.mode,
          location: interview.location,
          meetingUrl: interview.meetingUrl,
          interviewers: interview.panel.map((entry) => entry.name || entry.email),
          kind: cancelled ? "cancelled" : "updated",
          candidateToken: interview.candidateToken,
        });

        if (!cancelled) {
          await Promise.all(
            interview.panel.map((entry) =>
              sendFellowshipInterviewerEmail({
                name: entry.name || entry.email,
                email: entry.email,
                candidateName: interview.candidateName,
                reference: interview.reference,
                track: interview.track,
                scheduledAt: interview.scheduledAt,
                mode: interview.mode,
                location: interview.location,
                meetingUrl: interview.meetingUrl,
                token: entry.token,
                portalToken: entry.portalToken,
              }),
            ),
          );
        }
      } catch (error) {
        this.logger.error(
          `Fellowship interview update mail failed for ${interview.reference}: ${
            error instanceof Error ? error.message : "unknown error"
          }`,
        );
      }
    }

    await this.audit.log({
      actorEmail: user?.email,
      action: "interview.updated",
      entityType: "interview",
      entityId: interview.id,
      applicationId: interview.applicationId,
      detail: [
        body.scheduledAt ? `scheduled ${interview.scheduledAt}` : "",
        body.status ? `status ${body.status}` : "",
      ]
        .filter(Boolean)
        .join("; "),
    });

    return { interview };
  }

  @Post(":id/scorecard")
  @AdminOnly()
  @ApiBearerAuth()
  async scorecard(
    @Param("id") id: string,
    @CurrentUser() user: SessionUser | null,
    @Body() body: FellowshipScorecardDto,
  ) {
    if (!user?.email) {
      throw new UnauthorizedException("An authenticated admin email is required");
    }
    const result = await this.service.submitAsAdmin(id, user, body);
    await this.audit.log({
      actorEmail: user.email,
      action: "interview.scored",
      entityType: "interview",
      entityId: id,
      detail: `Recommendation: ${body.recommendation}`,
    });
    return result;
  }

  @Patch(":id/panel")
  @AdminOnly()
  @ApiBearerAuth()
  async updatePanel(
    @Param("id") id: string,
    @Body() body: UpdateFellowshipInterviewPanelDto,
    @CurrentUser() user: SessionUser | null,
  ) {
    const result = await this.service.updatePanel(id, body);
    for (const entry of result.addedPanel) {
      try {
        await this.sendPanelInvite(result.interview, entry);
        await this.service.markPanelSent(entry.id);
      } catch (error) {
        this.logger.error(
          `Panel invite failed for ${entry.email}: ${
            error instanceof Error ? error.message : "unknown error"
          }`,
        );
      }
    }
    await this.audit.log({
      actorEmail: user?.email,
      action: "interview.panel_updated",
      entityType: "interview",
      entityId: id,
      applicationId: result.interview.applicationId,
      detail: `Added ${result.addedPanel.length} panelist(s)`,
    });
    return { interview: result.interview };
  }

  @Post(":id/panel/:panelId/rotate")
  @AdminOnly()
  @ApiBearerAuth()
  async rotateToken(
    @Param("id") id: string,
    @Param("panelId") panelId: string,
    @Body() body: FellowshipPanelTokenDto,
    @CurrentUser() user: SessionUser | null,
  ) {
    await this.service.rotatePanelToken(panelId, body);
    const detail = await this.service.panelDetail(panelId);
    if (detail.panel) {
      try {
        await this.sendPanelInvite(detail.interview, detail.panel);
        await this.service.markPanelSent(panelId);
      } catch (error) {
        this.logger.error(
          `Panel token resend failed for ${detail.panel.email}: ${
            error instanceof Error ? error.message : "unknown error"
          }`,
        );
      }
    }
    await this.audit.log({
      actorEmail: user?.email,
      action: "interview.token_rotated",
      entityType: "interview",
      entityId: id,
      applicationId: detail.interview.applicationId,
      detail: panelId,
    });
    return { panel: detail.panel };
  }

  @Post(":id/panel/:panelId/revoke")
  @AdminOnly()
  @ApiBearerAuth()
  async revokeToken(
    @Param("id") id: string,
    @Param("panelId") panelId: string,
    @CurrentUser() user: SessionUser | null,
  ) {
    const result = await this.service.revokePanelToken(panelId);
    await this.audit.log({
      actorEmail: user?.email,
      action: "interview.token_revoked",
      entityType: "interview",
      entityId: id,
      detail: panelId,
    });
    return result;
  }

  @Post(":id/panel/:panelId/resend")
  @AdminOnly()
  @ApiBearerAuth()
  async resendPanel(
    @Param("panelId") panelId: string,
    @CurrentUser() user: SessionUser | null,
  ) {
    const detail = await this.service.panelDetail(panelId);
    if (!detail.panel) {
      throw new NotFoundException("Panelist not found");
    }
    await this.sendPanelInvite(detail.interview, detail.panel);
    await this.service.markPanelSent(panelId);
    await this.audit.log({
      actorEmail: user?.email,
      action: "interview.invite_resent",
      entityType: "panel",
      entityId: panelId,
      applicationId: detail.interview.applicationId,
      detail: detail.panel.email,
    });
    return { ok: true };
  }

  @Get("reminders/upcoming")
  @AdminOnly()
  @ApiBearerAuth()
  async upcomingReminders() {
    return this.service.upcomingReminders(48);
  }

  @Post("reminders/run")
  @AdminOnly()
  @ApiBearerAuth()
  async runReminders(@CurrentUser() user: SessionUser | null) {
    const { interviews } = await this.service.upcomingReminders(48);
    let sent = 0;
    for (const interview of interviews) {
      try {
        await sendFellowshipInterviewCandidateEmail({
          reference: interview.reference,
          candidateName: interview.candidateName,
          candidateEmail: interview.candidateEmail,
          scheduledAt: interview.scheduledAt,
          mode: interview.mode,
          location: interview.location,
          meetingUrl: interview.meetingUrl,
          interviewers: interview.panel.map((entry) => entry.name || entry.email),
          kind: "reminder",
          candidateToken: interview.candidateToken,
        });
        await this.service.markReminderSent(interview.id);
        sent += 1;
      } catch (error) {
        this.logger.error(
          `Interview reminder failed for ${interview.reference}: ${
            error instanceof Error ? error.message : "unknown error"
          }`,
        );
      }
    }
    await this.audit.log({
      actorEmail: user?.email,
      action: "interview.reminders_run",
      entityType: "interview",
      detail: `Sent ${sent}`,
    });
    return { sent };
  }

  @Get("candidate/token/:token")
  @Public()
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  async candidateInterview(@Param("token") token: string) {
    return this.service.findByCandidateToken(token);
  }

  @Post("candidate/token/:token/confirm")
  @Public()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  async confirmCandidate(@Param("token") token: string) {
    return this.service.confirmCandidate(token);
  }

  @Post("candidate/token/:token/reschedule")
  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  async rescheduleCandidate(
    @Param("token") token: string,
    @Body() body: FellowshipRescheduleRequestDto,
  ) {
    return this.service.requestReschedule(token, body);
  }

  @Get("candidate/token/:token/calendar.ics")
  @Public()
  @Header("Content-Type", "text/calendar; charset=utf-8")
  @Header("Content-Disposition", 'attachment; filename="kavi-fellowship-interview.ics"')
  async candidateCalendar(@Param("token") token: string) {
    const data = await this.service.findByCandidateToken(token);
    const interview = data.interview;
    return buildFellowshipInterviewIcs({
      uid: interview.reference,
      scheduledAt: interview.scheduledAt,
      candidateName: interview.candidateName,
      reference: interview.reference,
      mode: interview.mode,
      location: interview.location,
      meetingUrl: interview.meetingUrl,
      panel: interview.panel.map((member) => member.name),
    });
  }

  @Get("token/:token")
  @Public()
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  async token(@Param("token") token: string) {
    return this.service.findByToken(token);
  }

  @Get("token/:token/calendar.ics")
  @Public()
  @Header("Content-Type", "text/calendar; charset=utf-8")
  @Header("Content-Disposition", 'attachment; filename="kavi-fellowship-interview.ics"')
  async panelCalendar(@Param("token") token: string) {
    const data = await this.service.findByToken(token);
    const interview = data.interview;
    return buildFellowshipInterviewIcs({
      uid: interview.reference,
      scheduledAt: interview.scheduledAt,
      candidateName: interview.candidateName,
      reference: interview.reference,
      mode: interview.mode,
      location: interview.location,
      meetingUrl: interview.meetingUrl,
      panel: [],
    });
  }

  @Post("token/:token")
  @Public()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  async submitToken(
    @Param("token") token: string,
    @Body() body: FellowshipScorecardDto,
  ) {
    return this.service.submitByToken(token, body);
  }

  private async sendPanelInvite(
    interview: FellowshipInterviewDto,
    panel: FellowshipPanelDto,
  ): Promise<void> {
    await sendFellowshipInterviewerEmail({
      name: panel.name || panel.email,
      email: panel.email,
      candidateName: interview.candidateName,
      reference: interview.reference,
      track: interview.track,
      scheduledAt: interview.scheduledAt,
      mode: interview.mode,
      location: interview.location,
      meetingUrl: interview.meetingUrl,
      token: panel.token,
      portalToken: panel.portalToken,
    });
  }
}
