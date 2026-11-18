import { Module } from "@nestjs/common";

import { FellowshipInterviewsController } from "@/modules/fellowship-interviews/fellowship-interviews.controller";
import { FellowshipInterviewsService } from "@/modules/fellowship-interviews/fellowship-interviews.service";

@Module({
  controllers: [FellowshipInterviewsController],
  providers: [FellowshipInterviewsService],
})
export class FellowshipInterviewsModule {}
