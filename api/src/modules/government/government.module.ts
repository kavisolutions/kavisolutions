import { Module } from "@nestjs/common";

import { GovernmentController } from "@/modules/government/government.controller";
import { LeadsModule } from "@/modules/leads/leads.module";
import { SettingsModule } from "@/modules/settings/settings.module";

@Module({
  imports: [SettingsModule, LeadsModule],
  controllers: [GovernmentController],
})
export class GovernmentModule {}
