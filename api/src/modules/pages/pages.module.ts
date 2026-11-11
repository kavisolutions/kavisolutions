import { Module } from "@nestjs/common";

import { PagesController } from "@/modules/pages/pages.controller";
import { PagesService } from "@/modules/pages/pages.service";

@Module({
  controllers: [PagesController],
  providers: [PagesService],
  exports: [PagesService],
})
export class PagesModule {}
