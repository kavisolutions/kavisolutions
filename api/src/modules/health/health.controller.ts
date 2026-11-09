import { Controller, Get } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

import { Public } from "@/auth/auth.decorators";

@ApiTags("health")
@Controller("health")
export class HealthController {
  @Get()
  @Public()
  check() {
    return { status: "ok", timestamp: new Date().toISOString() };
  }
}
