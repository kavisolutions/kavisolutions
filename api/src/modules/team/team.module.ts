import { Module } from "@nestjs/common";

import { TeamController } from "@/modules/team/team.controller";
import { TeamRepository } from "@/modules/team/team.repository";
import { TeamService } from "@/modules/team/team.service";

@Module({
  controllers: [TeamController],
  providers: [TeamRepository, TeamService],
  exports: [TeamService, TeamRepository],
})
export class TeamModule {}
