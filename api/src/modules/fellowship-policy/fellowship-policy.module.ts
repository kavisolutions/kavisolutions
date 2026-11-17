import { Module } from "@nestjs/common";

import { FellowshipPolicyController } from "@/modules/fellowship-policy/fellowship-policy.controller";
import { FellowshipPolicyService } from "@/modules/fellowship-policy/fellowship-policy.service";

@Module({
  controllers: [FellowshipPolicyController],
  providers: [FellowshipPolicyService],
})
export class FellowshipPolicyModule {}
