import { Module } from "@nestjs/common";

import { TeamsController } from "@/modules/teams/teams.controller";
import { TeamsService } from "@/modules/teams/teams.service";

@Module({
  controllers: [TeamsController],
  providers: [TeamsService],
})
export class TeamsModule {}
