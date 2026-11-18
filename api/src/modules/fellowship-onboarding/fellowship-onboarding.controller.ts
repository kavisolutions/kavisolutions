import { Body, Controller, Get, Param, Put } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

import { AdminOnly } from "@/auth/auth.decorators";
import { UpsertFellowshipOnboardingDto } from "@/modules/fellowship-onboarding/dto/fellowship-onboarding.dto";
import { FellowshipOnboardingService } from "@/modules/fellowship-onboarding/fellowship-onboarding.service";

@ApiTags("fellowship-onboarding")
@Controller("fellowship-onboarding")
export class FellowshipOnboardingController {
  constructor(private readonly service: FellowshipOnboardingService) {}

  @Get()
  @AdminOnly()
  @ApiBearerAuth()
  async list() {
    return this.service.list();
  }

  @Get(":applicationId")
  @AdminOnly()
  @ApiBearerAuth()
  async get(@Param("applicationId") applicationId: string) {
    return this.service.get(applicationId);
  }

  @Put(":applicationId")
  @AdminOnly()
  @ApiBearerAuth()
  async upsert(
    @Param("applicationId") applicationId: string,
    @Body() body: UpsertFellowshipOnboardingDto,
  ) {
    return this.service.upsert(applicationId, body);
  }
}
