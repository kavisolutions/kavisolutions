import { Module } from "@nestjs/common";

import { FellowshipOperationsController } from "@/modules/fellowship-operations/fellowship-operations.controller";
import { FellowshipOperationsService } from "@/modules/fellowship-operations/fellowship-operations.service";

@Module({
  controllers: [FellowshipOperationsController],
  providers: [FellowshipOperationsService],
})
export class FellowshipOperationsModule {}
