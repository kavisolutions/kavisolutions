import { Module } from "@nestjs/common";

import { LeadsModule } from "@/modules/leads/leads.module";
import { SettingsModule } from "@/modules/settings/settings.module";
import { SurveyController } from "@/modules/survey/survey.controller";
import { SurveyService } from "@/modules/survey/survey.service";

@Module({
  imports: [SettingsModule, LeadsModule],
  controllers: [SurveyController],
  providers: [SurveyService],
})
export class SurveyModule {}
