import { Body, Controller, Get, Put } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

import { AdminOnly } from "@/auth/auth.decorators";
import { SettingsService, type SettingsPayload } from "@/modules/settings/settings.service";

@ApiTags("settings")
@Controller("settings")
@AdminOnly()
@ApiBearerAuth()
export class SettingsController {
  constructor(private readonly service: SettingsService) {}

  @Get()
  async get() {
    return this.service.get();
  }

  @Put()
  async update(@Body() body: SettingsPayload) {
    return this.service.update(body);
  }
}
