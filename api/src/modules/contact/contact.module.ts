import { Module } from "@nestjs/common";

import { ContactController } from "@/modules/contact/contact.controller";
import { LeadsModule } from "@/modules/leads/leads.module";
import { SettingsModule } from "@/modules/settings/settings.module";

@Module({
  imports: [SettingsModule, LeadsModule],
  controllers: [ContactController],
})
export class ContactModule {}
