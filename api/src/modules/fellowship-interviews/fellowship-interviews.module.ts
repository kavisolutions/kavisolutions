import { Module } from "@nestjs/common";

import { FellowshipAuditModule } from "@/modules/fellowship-audit/fellowship-audit.module";
import { FellowshipInterviewsController } from "@/modules/fellowship-interviews/fellowship-interviews.controller";
import { FellowshipInterviewsService } from "@/modules/fellowship-interviews/fellowship-interviews.service";

@Module({
  imports: [FellowshipAuditModule],
  controllers: [FellowshipInterviewsController],
  providers: [FellowshipInterviewsService],
})
export class FellowshipInterviewsModule {}
