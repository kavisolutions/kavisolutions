import { Body, Controller, Delete, Get, Post, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

import { AdminOnly } from "@/auth/auth.decorators";
import { AdminsService } from "@/modules/admins/admins.service";

@ApiTags("admins")
@Controller("admins")
@AdminOnly()
@ApiBearerAuth()
export class AdminsController {
  constructor(private readonly service: AdminsService) {}

  @Get()
  async list() {
    return this.service.list();
  }

  @Post()
  async add(@Body() body: { email?: string }) {
    return this.service.add(body?.email);
  }

  @Delete()
  async remove(@Query("email") email: string) {
    return this.service.remove(email);
  }
}
