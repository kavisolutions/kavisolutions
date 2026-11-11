import { Module } from "@nestjs/common";

import { SettingsModule } from "@/modules/settings/settings.module";
import { SurveyController } from "@/modules/survey/survey.controller";

@Module({
  imports: [SettingsModule],
  controllers: [SurveyController],
})
export class SurveyModule {}
