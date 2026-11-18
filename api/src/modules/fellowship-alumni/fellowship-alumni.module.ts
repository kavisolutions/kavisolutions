import { Module } from "@nestjs/common";

import { FellowshipAlumniController } from "@/modules/fellowship-alumni/fellowship-alumni.controller";
import { FellowshipAlumniService } from "@/modules/fellowship-alumni/fellowship-alumni.service";
import { FellowshipAuditModule } from "@/modules/fellowship-audit/fellowship-audit.module";

@Module({
  imports: [FellowshipAuditModule],
  controllers: [FellowshipAlumniController],
  providers: [FellowshipAlumniService],
  exports: [FellowshipAlumniService],
})
export class FellowshipAlumniModule {}
