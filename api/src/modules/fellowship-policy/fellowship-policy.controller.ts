import { Body, Controller, Get, Put } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

import { AdminOnly, Public } from "@/auth/auth.decorators";
import { UpdateFellowshipPolicyDto } from "@/modules/fellowship-policy/dto/update-fellowship-policy.dto";
import { FellowshipPolicyService } from "@/modules/fellowship-policy/fellowship-policy.service";

@ApiTags("fellowship-policy")
@Controller("fellowship-policy")
export class FellowshipPolicyController {
  constructor(private readonly service: FellowshipPolicyService) {}

  @Get()
  @Public()
  async get() {
    return { policy: await this.service.get() };
  }

  @Put()
  @AdminOnly()
  @ApiBearerAuth()
  async update(@Body() body: UpdateFellowshipPolicyDto) {
    return { policy: await this.service.update(body) };
  }
}
