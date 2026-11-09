import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

import { AdminOnly } from "@/auth/auth.decorators";
import { TeamsService } from "@/modules/teams/teams.service";

@ApiTags("teams")
@Controller("teams")
@AdminOnly()
@ApiBearerAuth()
export class TeamsController {
  constructor(private readonly service: TeamsService) {}

  @Get()
  async list() {
    return this.service.list();
  }

  @Post()
  async create(@Body() body: { name?: string }) {
    return this.service.create(body?.name);
  }

  @Patch(":id")
  async rename(@Param("id") id: string, @Body() body: { name?: string }) {
    return this.service.rename(id, body?.name);
  }

  @Delete(":id")
  async remove(@Param("id") id: string) {
    return this.service.remove(id);
  }
}
