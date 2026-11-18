import { Module } from "@nestjs/common";

import { FellowshipAuditModule } from "@/modules/fellowship-audit/fellowship-audit.module";
import { FellowshipInterviewsController } from "@/modules/fellowship-interviews/fellowship-interviews.controller";
import { FellowshipInterviewsService } from "@/modules/fellowship-interviews/fellowship-interviews.service";
import { WhatsAppModule } from "@/modules/whatsapp/whatsapp.module";

@Module({
  imports: [FellowshipAuditModule, WhatsAppModule],
  controllers: [FellowshipInterviewsController],
  providers: [FellowshipInterviewsService],
  exports: [FellowshipInterviewsService],
})
export class FellowshipInterviewsModule {}
