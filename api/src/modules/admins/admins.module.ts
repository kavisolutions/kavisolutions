import { Module } from "@nestjs/common";

import { AdminsController } from "@/modules/admins/admins.controller";
import { AdminsService } from "@/modules/admins/admins.service";

@Module({
  controllers: [AdminsController],
  providers: [AdminsService],
})
export class AdminsModule {}
