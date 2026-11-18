import { Controller, Get, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

import { AdminOnly } from "@/auth/auth.decorators";
import { FellowshipAuditService } from "@/modules/fellowship-audit/fellowship-audit.service";

@ApiTags("fellowship-audit")
@Controller("fellowship-audit")
export class FellowshipAuditController {
  constructor(private readonly service: FellowshipAuditService) {}

  @Get()
  @AdminOnly()
  @ApiBearerAuth()
  async list(
    @Query("applicationId") applicationId?: string,
    @Query("limit") limit?: string,
  ) {
    return this.service.list({
      applicationId,
      limit: limit ? Number(limit) : undefined,
    });
  }
}
