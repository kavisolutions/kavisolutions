import { Controller, Get } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

import { CurrentIsAdmin, CurrentUser } from "@/auth/auth.guard";
import { OptionalAuth } from "@/auth/auth.decorators";
import type { SessionUser } from "@/auth/auth.types";
import { TeamService } from "@/modules/team/team.service";

@ApiTags("me")
@Controller("me")
export class MeController {
  constructor(private readonly teamService: TeamService) {}

  @Get()
  @OptionalAuth()
  @ApiBearerAuth()
  async me(
    @CurrentUser() user: SessionUser | null,
    @CurrentIsAdmin() isAdmin: boolean,
  ) {
    if (!user) {
      return { user: null, isAdmin: false, member: null, roles: [], teams: [] };
    }

    return this.teamService.me(user, isAdmin);
  }
}
