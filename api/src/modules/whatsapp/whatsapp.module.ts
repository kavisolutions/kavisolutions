import { Module } from "@nestjs/common";

import { FellowshipAuditModule } from "@/modules/fellowship-audit/fellowship-audit.module";
import { WhatsAppController } from "@/modules/whatsapp/whatsapp.controller";
import { WhatsAppSettingsService } from "@/modules/whatsapp/whatsapp-settings.service";
import { WhatsAppService } from "@/modules/whatsapp/whatsapp.service";

@Module({
  imports: [FellowshipAuditModule],
  controllers: [WhatsAppController],
  providers: [WhatsAppService, WhatsAppSettingsService],
  exports: [WhatsAppService],
})
export class WhatsAppModule {}
