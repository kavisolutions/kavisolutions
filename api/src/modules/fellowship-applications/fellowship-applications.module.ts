import { Module } from "@nestjs/common";

import { SettingsModule } from "@/modules/settings/settings.module";
import { FellowshipApplicationsController } from "@/modules/fellowship-applications/fellowship-applications.controller";
import { FellowshipApplicationsService } from "@/modules/fellowship-applications/fellowship-applications.service";

@Module({
  imports: [SettingsModule],
  controllers: [FellowshipApplicationsController],
  providers: [FellowshipApplicationsService],
})
export class FellowshipApplicationsModule {}
