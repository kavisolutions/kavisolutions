import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Post,
  Query,
  UnauthorizedException,
} from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

import { sendFellowshipReviewInviteEmail } from "@/_shared/mailer";
import { AdminOnly, Public } from "@/auth/auth.decorators";
import { CurrentUser } from "@/auth/auth.guard";
import type { SessionUser } from "@/auth/auth.types";
import { FellowshipAuditService } from "@/modules/fellowship-audit/fellowship-audit.service";
import {
  AssignFellowshipReviewDto,
  FellowshipReviewScorecardDto,
} from "@/modules/fellowship-reviews/dto/fellowship-review.dto";
import { FellowshipReviewsService } from "@/modules/fellowship-reviews/fellowship-reviews.service";

@ApiTags("fellowship-reviews")
@Controller("fellowship-reviews")
export class FellowshipReviewsController {
  private readonly logger = new Logger(FellowshipReviewsController.name);

  constructor(
    private readonly service: FellowshipReviewsService,
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
  async assign(
    @Body() body: AssignFellowshipReviewDto,
    @CurrentUser() user: SessionUser | null,
  ) {
    const review = await this.service.assign(body);

    try {
      await sendFellowshipReviewInviteEmail({
        reviewerName: review.reviewerName,
        reviewerEmail: review.reviewerEmail,
        candidateName: review.candidateName,
        reference: review.reference,
        track: review.track,
        city: "",
        token: review.token,
      });
    } catch (error) {
      this.logger.error(
        `Fellowship review invite failed for ${review.reference}: ${
          error instanceof Error ? error.message : "unknown error"
        }`,
      );
    }

    await this.audit.log({
      actorEmail: user?.email,
      action: "review.assigned",
      entityType: "application",
      entityId: review.applicationId,
      applicationId: review.applicationId,
      detail: `Assigned ${review.reviewerEmail}`,
    });

    return { review };
  }

  @Post("application/:applicationId/scorecard")
  @AdminOnly()
  @ApiBearerAuth()
  async scoreAsAdmin(
    @Param("applicationId") applicationId: string,
    @CurrentUser() user: SessionUser | null,
    @Body() body: FellowshipReviewScorecardDto,
  ) {
    if (!user?.email) {
      throw new UnauthorizedException("An authenticated admin email is required");
    }
    const result = await this.service.submitAsAdmin(applicationId, user, body);
    await this.audit.log({
      actorEmail: user.email,
      action: "review.scored",
      entityType: "application",
      entityId: applicationId,
      applicationId,
      detail: `Recommendation: ${result.review.recommendation}`,
    });
    return result;
  }

  @Post(":id/revoke")
  @AdminOnly()
  @ApiBearerAuth()
  async revoke(@Param("id") id: string, @CurrentUser() user: SessionUser | null) {
    const result = await this.service.revoke(id);
    await this.audit.log({
      actorEmail: user?.email,
      action: "review.revoked",
      entityType: "review",
      entityId: id,
    });
    return result;
  }

  @Delete(":id")
  @AdminOnly()
  @ApiBearerAuth()
  async remove(@Param("id") id: string, @CurrentUser() user: SessionUser | null) {
    const result = await this.service.remove(id);
    await this.audit.log({
      actorEmail: user?.email,
      action: "review.deleted",
      entityType: "review",
      entityId: id,
    });
    return result;
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
    @Body() body: FellowshipReviewScorecardDto,
  ) {
    return this.service.submitByToken(token, body);
  }
}
