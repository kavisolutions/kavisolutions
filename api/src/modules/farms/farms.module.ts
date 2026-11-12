import { Module } from "@nestjs/common";

import { FarmsController } from "@/modules/farms/farms.controller";
import { SettingsModule } from "@/modules/settings/settings.module";

@Module({
  imports: [SettingsModule],
  controllers: [FarmsController],
})
export class FarmsModule {}
