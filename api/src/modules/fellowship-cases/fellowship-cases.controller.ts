import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

import { AdminOnly } from "@/auth/auth.decorators";
import { CurrentUser } from "@/auth/auth.guard";
import type { SessionUser } from "@/auth/auth.types";
import { FellowshipAuditService } from "@/modules/fellowship-audit/fellowship-audit.service";
import {
  CreateFellowshipCaseDto,
  UpdateFellowshipCaseDto,
} from "@/modules/fellowship-cases/dto/fellowship-case.dto";
import { FellowshipCasesService } from "@/modules/fellowship-cases/fellowship-cases.service";

@ApiTags("fellowship-cases")
@Controller("fellowship-cases")
export class FellowshipCasesController {
  constructor(
    private readonly service: FellowshipCasesService,
    private readonly audit: FellowshipAuditService,
  ) {}

  @Get()
  @AdminOnly()
  @ApiBearerAuth()
  async list(
    @Query("status") status?: string,
    @Query("category") category?: string,
  ) {
    return this.service.list({ status, category });
  }

  @Post()
  @AdminOnly()
  @ApiBearerAuth()
  async create(
    @Body() body: CreateFellowshipCaseDto,
    @CurrentUser() user: SessionUser | null,
  ) {
    const result = await this.service.create(body);
    await this.audit.log({
      actorEmail: user?.email,
      action: "case.created",
      entityType: "case",
      entityId: result.case.id,
      applicationId: result.case.applicationId,
      detail: `${result.case.category}/${result.case.severity}`,
    });
    return result;
  }

  @Patch(":id")
  @AdminOnly()
  @ApiBearerAuth()
  async update(
    @Param("id") id: string,
    @Body() body: UpdateFellowshipCaseDto,
    @CurrentUser() user: SessionUser | null,
  ) {
    const result = await this.service.update(id, body);
    await this.audit.log({
      actorEmail: user?.email,
      action: "case.updated",
      entityType: "case",
      entityId: id,
      applicationId: result.case.applicationId,
      detail: result.case.status,
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
      action: "case.deleted",
      entityType: "case",
      entityId: id,
    });
    return result;
  }
}
