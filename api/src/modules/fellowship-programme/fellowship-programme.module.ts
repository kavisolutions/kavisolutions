import { Module } from "@nestjs/common";

import { FellowshipAlumniModule } from "@/modules/fellowship-alumni/fellowship-alumni.module";
import { FellowshipApplicationsModule } from "@/modules/fellowship-applications/fellowship-applications.module";
import { FellowshipAuditModule } from "@/modules/fellowship-audit/fellowship-audit.module";
import { FellowshipInterviewsModule } from "@/modules/fellowship-interviews/fellowship-interviews.module";
import { LeadsModule } from "@/modules/leads/leads.module";
import { FellowshipAutomationService } from "@/modules/fellowship-programme/fellowship-automation.service";
import { FellowshipProgrammeController } from "@/modules/fellowship-programme/fellowship-programme.controller";
import { FellowshipProgrammeService } from "@/modules/fellowship-programme/fellowship-programme.service";
import { SettingsModule } from "@/modules/settings/settings.module";
import { WhatsAppModule } from "@/modules/whatsapp/whatsapp.module";

@Module({
  imports: [
    SettingsModule,
    FellowshipAuditModule,
    FellowshipInterviewsModule,
    FellowshipApplicationsModule,
    FellowshipAlumniModule,
    WhatsAppModule,
    LeadsModule,
  ],
  controllers: [FellowshipProgrammeController],
  providers: [FellowshipProgrammeService, FellowshipAutomationService],
})
export class FellowshipProgrammeModule {}
