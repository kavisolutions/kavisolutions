import { Module } from "@nestjs/common";

import { FellowshipTemplatesController } from "@/modules/fellowship-templates/fellowship-templates.controller";
import { FellowshipTemplatesService } from "@/modules/fellowship-templates/fellowship-templates.service";

@Module({
  controllers: [FellowshipTemplatesController],
  providers: [FellowshipTemplatesService],
  exports: [FellowshipTemplatesService],
})
export class FellowshipTemplatesModule {}
