import { Module } from "@nestjs/common";

import { FellowshipOnboardingController } from "@/modules/fellowship-onboarding/fellowship-onboarding.controller";
import { FellowshipOnboardingService } from "@/modules/fellowship-onboarding/fellowship-onboarding.service";

@Module({
  controllers: [FellowshipOnboardingController],
  providers: [FellowshipOnboardingService],
})
export class FellowshipOnboardingModule {}
