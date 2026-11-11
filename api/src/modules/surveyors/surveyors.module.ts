import { Module } from "@nestjs/common";

import { SettingsModule } from "@/modules/settings/settings.module";
import { SurveyorsController } from "@/modules/surveyors/surveyors.controller";
import { SurveyorsService } from "@/modules/surveyors/surveyors.service";

@Module({
  imports: [SettingsModule],
  controllers: [SurveyorsController],
  providers: [SurveyorsService],
})
export class SurveyorsModule {}
