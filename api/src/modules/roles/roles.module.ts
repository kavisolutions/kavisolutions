import { Module } from "@nestjs/common";

import { RolesController } from "@/modules/roles/roles.controller";
import { RolesService } from "@/modules/roles/roles.service";
import { TeamModule } from "@/modules/team/team.module";

@Module({
  imports: [TeamModule],
  controllers: [RolesController],
  providers: [RolesService],
})
export class RolesModule {}
