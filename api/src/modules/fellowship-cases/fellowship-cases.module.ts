import { Module } from "@nestjs/common";

import { FellowshipAuditModule } from "@/modules/fellowship-audit/fellowship-audit.module";
import { FellowshipCasesController } from "@/modules/fellowship-cases/fellowship-cases.controller";
import { FellowshipCasesService } from "@/modules/fellowship-cases/fellowship-cases.service";

@Module({
  imports: [FellowshipAuditModule],
  controllers: [FellowshipCasesController],
  providers: [FellowshipCasesService],
})
export class FellowshipCasesModule {}
