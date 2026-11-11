import { Body, Controller, Get, Patch } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

import { AdminOnly, Public } from "@/auth/auth.decorators";
import { UpdatePagesDto } from "@/modules/pages/dto/update-pages.dto";
import { PagesService } from "@/modules/pages/pages.service";

@ApiTags("pages")
@Controller("pages")
export class PagesController {
  constructor(private readonly service: PagesService) {}

  /* Read by the Next.js server components that gate /survey and /financial.
     Public on purpose: it reports only whether a page is published, never any
     of its content. No caching — a toggle has to take effect immediately. */
  @Get()
  @Public()
  async get() {
    return this.service.get();
  }

  @Patch()
  @AdminOnly()
  @ApiBearerAuth()
  async update(@Body() body: UpdatePagesDto) {
    return this.service.update(body);
  }
}
