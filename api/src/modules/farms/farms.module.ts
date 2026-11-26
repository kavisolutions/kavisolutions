import { Module } from "@nestjs/common";

import { FarmsController } from "@/modules/farms/farms.controller";
import { LeadsModule } from "@/modules/leads/leads.module";
import { SettingsModule } from "@/modules/settings/settings.module";

@Module({
  imports: [SettingsModule, LeadsModule],
  controllers: [FarmsController],
})
export class FarmsModule {}
