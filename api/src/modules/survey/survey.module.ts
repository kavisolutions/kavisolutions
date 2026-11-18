import { Module } from "@nestjs/common";

import { SettingsModule } from "@/modules/settings/settings.module";
import { SurveyController } from "@/modules/survey/survey.controller";
import { SurveyService } from "@/modules/survey/survey.service";

@Module({
  imports: [SettingsModule],
  controllers: [SurveyController],
  providers: [SurveyService],
})
export class SurveyModule {}
