import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

import { AdminOnly } from "@/auth/auth.decorators";
import { UpsertFellowshipEmailTemplateDto } from "@/modules/fellowship-templates/dto/fellowship-template.dto";
import { FellowshipTemplatesService } from "@/modules/fellowship-templates/fellowship-templates.service";

@ApiTags("fellowship-templates")
@Controller("fellowship-email-templates")
export class FellowshipTemplatesController {
  constructor(private readonly service: FellowshipTemplatesService) {}

  @Get()
  @AdminOnly()
  @ApiBearerAuth()
  async list() {
    return this.service.list();
  }

  @Put(":key")
  @AdminOnly()
  @ApiBearerAuth()
  async upsert(
    @Param("key") key: string,
    @Body() body: UpsertFellowshipEmailTemplateDto,
  ) {
    return this.service.upsert(key, body.subject, body.body);
  }

  @Delete(":key")
  @AdminOnly()
  @ApiBearerAuth()
  async remove(@Param("key") key: string) {
    return this.service.remove(key);
  }
}
