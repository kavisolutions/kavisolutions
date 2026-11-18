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
  CreateFellowshipDeliveryReviewDto,
  UpdateFellowshipDeliveryReviewDto,
} from "@/modules/fellowship-delivery/dto/fellowship-delivery.dto";
import { FellowshipDeliveryService } from "@/modules/fellowship-delivery/fellowship-delivery.service";

@ApiTags("fellowship-delivery")
@Controller("fellowship-delivery")
export class FellowshipDeliveryController {
  constructor(
    private readonly service: FellowshipDeliveryService,
    private readonly audit: FellowshipAuditService,
  ) {}

  @Get()
  @AdminOnly()
  @ApiBearerAuth()
  async list(
    @Query("applicationId") applicationId?: string,
    @Query("atRisk") atRisk?: string,
  ) {
    return this.service.list({
      applicationId,
      atRisk: atRisk === "true" ? true : atRisk === "false" ? false : undefined,
    });
  }

  @Post()
  @AdminOnly()
  @ApiBearerAuth()
  async create(
    @Body() body: CreateFellowshipDeliveryReviewDto,
    @CurrentUser() user: SessionUser | null,
  ) {
    const result = await this.service.create(body);
    await this.audit.log({
      actorEmail: user?.email,
      action: "delivery.review_created",
      entityType: "application",
      entityId: result.review.applicationId,
      applicationId: result.review.applicationId,
      detail: `${result.review.type} review${result.review.atRisk ? " (at risk)" : ""}`,
    });
    return result;
  }

  @Patch(":id")
  @AdminOnly()
  @ApiBearerAuth()
  async update(
    @Param("id") id: string,
    @Body() body: UpdateFellowshipDeliveryReviewDto,
    @CurrentUser() user: SessionUser | null,
  ) {
    const result = await this.service.update(id, body);
    await this.audit.log({
      actorEmail: user?.email,
      action: "delivery.review_updated",
      entityType: "application",
      entityId: result.review.applicationId,
      applicationId: result.review.applicationId,
      detail: `${result.review.type} review`,
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
      action: "delivery.review_deleted",
      entityType: "delivery-review",
      entityId: id,
    });
    return result;
  }
}
