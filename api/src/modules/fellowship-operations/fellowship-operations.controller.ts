import { Controller, Get } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

import { AdminOnly } from "@/auth/auth.decorators";
import { FellowshipOperationsService } from "@/modules/fellowship-operations/fellowship-operations.service";

@ApiTags("fellowship-operations")
@Controller("fellowship-operations")
export class FellowshipOperationsController {
  constructor(private readonly service: FellowshipOperationsService) {}

  @Get("dashboard")
  @AdminOnly()
  @ApiBearerAuth()
  async dashboard() {
    return this.service.dashboard();
  }

  @Get("cohorts")
  @AdminOnly()
  @ApiBearerAuth()
  async cohorts() {
    return this.service.cohorts();
  }
}
