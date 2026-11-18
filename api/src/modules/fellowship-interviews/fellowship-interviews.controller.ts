import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Patch,
  Post,
  Query,
  UnauthorizedException,
} from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

import {
  sendFellowshipInterviewCandidateEmail,
  sendFellowshipInterviewerEmail,
} from "@/_shared/mailer";
import { AdminOnly, Public } from "@/auth/auth.decorators";
import { CurrentUser } from "@/auth/auth.guard";
import type { SessionUser } from "@/auth/auth.types";
import {
  CreateFellowshipInterviewDto,
  FellowshipScorecardDto,
  UpdateFellowshipInterviewDto,
} from "@/modules/fellowship-interviews/dto/fellowship-interview.dto";
import { FellowshipInterviewsService } from "@/modules/fellowship-interviews/fellowship-interviews.service";

@ApiTags("fellowship-interviews")
@Controller("fellowship-interviews")
export class FellowshipInterviewsController {
  private readonly logger = new Logger(FellowshipInterviewsController.name);

  constructor(private readonly service: FellowshipInterviewsService) {}

  @Get()
  @AdminOnly()
  @ApiBearerAuth()
  async list(@Query("applicationId") applicationId?: string) {
    return this.service.list({ applicationId });
  }

  @Post()
  @AdminOnly()
  @ApiBearerAuth()
  async create(@Body() body: CreateFellowshipInterviewDto) {
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

    return { interview };
  }

  @Patch(":id")
  @AdminOnly()
  @ApiBearerAuth()
  async update(
    @Param("id") id: string,
    @Body() body: UpdateFellowshipInterviewDto,
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
    return this.service.submitAsAdmin(id, user, body);
  }

  @Get("token/:token")
  @Public()
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  async token(@Param("token") token: string) {
    return this.service.findByToken(token);
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
}
