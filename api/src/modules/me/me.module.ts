import { Module } from "@nestjs/common";

import { MeController } from "@/modules/me/me.controller";
import { TeamModule } from "@/modules/team/team.module";

@Module({
  imports: [TeamModule],
  controllers: [MeController],
})
export class MeModule {}
