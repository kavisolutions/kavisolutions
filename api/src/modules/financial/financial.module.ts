import { Module } from "@nestjs/common";

import { FinancialController } from "@/modules/financial/financial.controller";
import { LeadsModule } from "@/modules/leads/leads.module";
import { SettingsModule } from "@/modules/settings/settings.module";

@Module({
  imports: [SettingsModule, LeadsModule],
  controllers: [FinancialController],
})
export class FinancialModule {}
