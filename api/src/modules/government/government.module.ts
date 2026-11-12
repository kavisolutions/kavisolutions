import { Module } from "@nestjs/common";

import { GovernmentController } from "@/modules/government/government.controller";
import { SettingsModule } from "@/modules/settings/settings.module";

@Module({
  imports: [SettingsModule],
  controllers: [GovernmentController],
})
export class GovernmentModule {}
