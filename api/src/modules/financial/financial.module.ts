import { Module } from "@nestjs/common";

import { FinancialController } from "@/modules/financial/financial.controller";
import { SettingsModule } from "@/modules/settings/settings.module";

@Module({
  imports: [SettingsModule],
  controllers: [FinancialController],
})
export class FinancialModule {}
