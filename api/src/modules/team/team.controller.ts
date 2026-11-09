import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UnauthorizedException,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

import { CurrentIsAdmin, CurrentUser } from "@/auth/auth.guard";
import { AdminOnly, OptionalAuth, Public } from "@/auth/auth.decorators";
import type { SessionUser } from "@/auth/auth.types";
import { CreateMemberDto, UpdateMemberDto } from "@/modules/team/dto/team.dto";
import { TeamService } from "@/modules/team/team.service";

@ApiTags("team")
@Controller("team")
export class TeamController {
  constructor(private readonly service: TeamService) {}

  @Get()
  @Public()
  async list(
    @CurrentUser() user: SessionUser | null,
    @CurrentIsAdmin() isAdmin: boolean,
  ) {
    return this.service.list(user, isAdmin);
  }

  @Post()
  @AdminOnly()
  @ApiBearerAuth()
  async create(@Body() body: CreateMemberDto) {
    return this.service.create(body);
  }

  @Patch(":id")
  @OptionalAuth()
  @ApiBearerAuth()
  async update(
    @Param("id") id: string,
    @Body() body: UpdateMemberDto,
    @CurrentUser() user: SessionUser | null,
    @CurrentIsAdmin() isAdmin: boolean,
  ) {
    if (!user) throw new UnauthorizedException("Sign in required");
    return this.service.update(id, body, user, isAdmin);
  }

  @Delete(":id")
  @AdminOnly()
  @ApiBearerAuth()
  async remove(@Param("id") id: string) {
    await this.service.remove(id);
    return { ok: true };
  }
}
