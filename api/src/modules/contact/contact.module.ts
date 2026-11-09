import { Module } from "@nestjs/common";

import { ContactController } from "@/modules/contact/contact.controller";
import { SettingsModule } from "@/modules/settings/settings.module";

@Module({
  imports: [SettingsModule],
  controllers: [ContactController],
})
export class ContactModule {}
