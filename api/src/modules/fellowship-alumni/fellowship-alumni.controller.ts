import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

import { sendFellowshipAlumniFollowUpEmail } from "@/_shared/mailer";
import { AdminOnly, Public } from "@/auth/auth.decorators";
import { CurrentUser } from "@/auth/auth.guard";
import type { SessionUser } from "@/auth/auth.types";
import { FellowshipAuditService } from "@/modules/fellowship-audit/fellowship-audit.service";
import {
  AlumniSelfUpdateDto,
  CreateFellowshipAlumniDto,
  UpdateFellowshipAlumniDto,
} from "@/modules/fellowship-alumni/dto/fellowship-alumni.dto";
import { FellowshipAlumniService } from "@/modules/fellowship-alumni/fellowship-alumni.service";

@ApiTags("fellowship-alumni")
@Controller("fellowship-alumni")
export class FellowshipAlumniController {
  private readonly logger = new Logger(FellowshipAlumniController.name);

  constructor(
    private readonly service: FellowshipAlumniService,
    private readonly audit: FellowshipAuditService,
  ) {}

  @Get("public")
  @Public()
  async publicStories() {
    return this.service.publicStories();
  }

  @Get()
  @AdminOnly()
  @ApiBearerAuth()
  async list(@Query("search") search?: string, @Query("cohort") cohort?: string) {
    return this.service.list({ search, cohort });
  }

  @Get("summary")
  @AdminOnly()
  @ApiBearerAuth()
  async summary() {
    return this.service.summary();
  }

  @Post()
  @AdminOnly()
  @ApiBearerAuth()
  async create(
    @Body() body: CreateFellowshipAlumniDto,
    @CurrentUser() user: SessionUser | null,
  ) {
    const result = await this.service.create(body);
    await this.audit.log({
      actorEmail: user?.email,
      action: "alumni.created",
      entityType: "alumni",
      entityId: result.alumni.id,
      applicationId: result.alumni.applicationId,
      detail: result.alumni.email,
    });
    return result;
  }

  @Patch(":id")
  @AdminOnly()
  @ApiBearerAuth()
  async update(
    @Param("id") id: string,
    @Body() body: UpdateFellowshipAlumniDto,
    @CurrentUser() user: SessionUser | null,
  ) {
    const result = await this.service.update(id, body);
    await this.audit.log({
      actorEmail: user?.email,
      action: "alumni.updated",
      entityType: "alumni",
      entityId: id,
      applicationId: result.alumni.applicationId,
      detail: result.alumni.destinationType,
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
      action: "alumni.deleted",
      entityType: "alumni",
      entityId: id,
    });
    return result;
  }

  @Get("follow-ups/due")
  @AdminOnly()
  @ApiBearerAuth()
  async dueFollowUps() {
    return this.service.dueFollowUps();
  }

  @Post("follow-ups/run")
  @AdminOnly()
  @ApiBearerAuth()
  async runFollowUps(@CurrentUser() user: SessionUser | null) {
    const { alumni } = await this.service.dueFollowUps();
    let sent = 0;
    for (const record of alumni) {
      try {
        await sendFellowshipAlumniFollowUpEmail({
          name: record.name,
          email: record.email,
          cohort: record.cohort,
          token: record.updateToken,
          kind: record.outcome6m ? "12m" : "6m",
        });
        await this.service.markFollowUpSent(record.id);
        sent += 1;
      } catch (error) {
        this.logger.error(
          `Alumni follow-up failed for ${record.email}: ${
            error instanceof Error ? error.message : "unknown error"
          }`,
        );
      }
    }
    await this.audit.log({
      actorEmail: user?.email,
      action: "alumni.follow_up_run",
      entityType: "alumni",
      detail: `Sent ${sent}`,
    });
    return { sent };
  }

  @Get("token/:token")
  @Public()
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  async self(@Param("token") token: string) {
    return this.service.findByUpdateToken(token);
  }

  @Patch("token/:token")
  @Public()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  async selfUpdate(
    @Param("token") token: string,
    @Body() body: AlumniSelfUpdateDto,
  ) {
    return this.service.updateByToken(token, body);
  }
}
