import { Module } from "@nestjs/common";

import { FellowshipAlumniController } from "@/modules/fellowship-alumni/fellowship-alumni.controller";
import { FellowshipAlumniService } from "@/modules/fellowship-alumni/fellowship-alumni.service";

@Module({
  controllers: [FellowshipAlumniController],
  providers: [FellowshipAlumniService],
})
export class FellowshipAlumniModule {}
