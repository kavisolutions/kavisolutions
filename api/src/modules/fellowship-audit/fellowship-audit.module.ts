import { Module } from "@nestjs/common";

import { FellowshipAuditController } from "@/modules/fellowship-audit/fellowship-audit.controller";
import { FellowshipAuditService } from "@/modules/fellowship-audit/fellowship-audit.service";

@Module({
  controllers: [FellowshipAuditController],
  providers: [FellowshipAuditService],
  exports: [FellowshipAuditService],
})
export class FellowshipAuditModule {}
