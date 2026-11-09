import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

import { AdminOnly } from "@/auth/auth.decorators";
import { RolesService } from "@/modules/roles/roles.service";

@ApiTags("roles")
@Controller("roles")
@AdminOnly()
@ApiBearerAuth()
export class RolesController {
  constructor(private readonly service: RolesService) {}

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
