import { Controller, Get } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

import { Public } from "@/auth/auth.decorators";
import { SettingsService } from "@/modules/settings/settings.service";

/* Deliberately separate from the admin-only SettingsController: the route
   guard treats class-level @AdminOnly() as stronger than @Public(), so a
   public method there would still be rejected. */
@ApiTags("settings")
@Public()
@Controller("settings/public")
export class PublicSettingsController {
  constructor(private readonly service: SettingsService) {}

  @Get()
  async get() {
    return this.service.publicInfo();
  }
}
