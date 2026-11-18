import { Module } from "@nestjs/common";

import { FellowshipAuditModule } from "@/modules/fellowship-audit/fellowship-audit.module";
import { FellowshipOnboardingController } from "@/modules/fellowship-onboarding/fellowship-onboarding.controller";
import { FellowshipDocumentsService } from "@/modules/fellowship-onboarding/fellowship-documents.service";
import { FellowshipOnboardingService } from "@/modules/fellowship-onboarding/fellowship-onboarding.service";
import { UploadModule } from "@/modules/upload/upload.module";

@Module({
  imports: [FellowshipAuditModule, UploadModule],
  controllers: [FellowshipOnboardingController],
  providers: [FellowshipOnboardingService, FellowshipDocumentsService],
})
export class FellowshipOnboardingModule {}
