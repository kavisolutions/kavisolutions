import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

import { AdminOnly, Public } from "@/auth/auth.decorators";
import { CurrentUser } from "@/auth/auth.guard";
import type { SessionUser } from "@/auth/auth.types";
import { FellowshipAuditService } from "@/modules/fellowship-audit/fellowship-audit.service";
import {
  CreateFellowshipMentorDto,
  UpdateFellowshipMentorDto,
} from "@/modules/fellowship-mentors/dto/fellowship-mentor.dto";
import { FellowshipMentorsService } from "@/modules/fellowship-mentors/fellowship-mentors.service";

@ApiTags("fellowship-mentors")
@Controller("fellowship-mentors")
export class FellowshipMentorsController {
  constructor(
    private readonly service: FellowshipMentorsService,
    private readonly audit: FellowshipAuditService,
  ) {}

  @Get()
  @AdminOnly()
  @ApiBearerAuth()
  async list(@Query("status") status?: string) {
    return this.service.list({ status });
  }

  @Post()
  @AdminOnly()
  @ApiBearerAuth()
  async create(
    @Body() body: CreateFellowshipMentorDto,
    @CurrentUser() user: SessionUser | null,
  ) {
    const mentor = await this.service.create(body);
    await this.audit.log({
      actorEmail: user?.email,
      action: "mentor.created",
      entityType: "mentor",
      entityId: mentor.id,
      detail: mentor.email,
    });
    return { mentor };
  }

  @Patch(":id")
  @AdminOnly()
  @ApiBearerAuth()
  async update(
    @Param("id") id: string,
    @Body() body: UpdateFellowshipMentorDto,
    @CurrentUser() user: SessionUser | null,
  ) {
    const mentor = await this.service.update(id, body);
    await this.audit.log({
      actorEmail: user?.email,
      action: "mentor.updated",
      entityType: "mentor",
      entityId: id,
      detail: mentor.status,
    });
    return { mentor };
  }

  @Post(":id/rotate-portal")
  @AdminOnly()
  @ApiBearerAuth()
  async rotatePortal(@Param("id") id: string, @CurrentUser() user: SessionUser | null) {
    const result = await this.service.rotatePortalToken(id);
    await this.audit.log({
      actorEmail: user?.email,
      action: "mentor.portal_rotated",
      entityType: "mentor",
      entityId: id,
    });
    return result;
  }

  @Get("portal/:token")
  @Public()
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  async portal(@Param("token") token: string) {
    return this.service.portal(token);
  }

  @Delete(":id")
  @AdminOnly()
  @ApiBearerAuth()
  async remove(@Param("id") id: string, @CurrentUser() user: SessionUser | null) {
    const result = await this.service.remove(id);
    await this.audit.log({
      actorEmail: user?.email,
      action: "mentor.deleted",
      entityType: "mentor",
      entityId: id,
    });
    return result;
  }
}
