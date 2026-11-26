import { Module } from "@nestjs/common";

import { PublicSettingsController } from "@/modules/settings/public-settings.controller";
import { SettingsController } from "@/modules/settings/settings.controller";
import { SettingsService } from "@/modules/settings/settings.service";

@Module({
  controllers: [SettingsController, PublicSettingsController],
  providers: [SettingsService],
  exports: [SettingsService],
})
export class SettingsModule {}
