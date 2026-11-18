import { Module } from "@nestjs/common";

import { FellowshipAuditModule } from "@/modules/fellowship-audit/fellowship-audit.module";
import { SettingsModule } from "@/modules/settings/settings.module";
import { FellowshipApplicationsController } from "@/modules/fellowship-applications/fellowship-applications.controller";
import { FellowshipApplicationsService } from "@/modules/fellowship-applications/fellowship-applications.service";
import { FellowshipTemplatesModule } from "@/modules/fellowship-templates/fellowship-templates.module";
import { WhatsAppModule } from "@/modules/whatsapp/whatsapp.module";

@Module({
  imports: [
    SettingsModule,
    FellowshipAuditModule,
    FellowshipTemplatesModule,
    WhatsAppModule,
  ],
  controllers: [FellowshipApplicationsController],
  providers: [FellowshipApplicationsService],
})
export class FellowshipApplicationsModule {}
