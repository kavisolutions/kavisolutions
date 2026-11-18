import {
  BadGatewayException,
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  ServiceUnavailableException,
} from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

import { AdminOnly } from "@/auth/auth.decorators";
import { CurrentUser } from "@/auth/auth.guard";
import type { SessionUser } from "@/auth/auth.types";
import { FellowshipAuditService } from "@/modules/fellowship-audit/fellowship-audit.service";
import { SendWhatsAppDto } from "@/modules/whatsapp/dto/whatsapp.dto";
import { WhatsAppService } from "@/modules/whatsapp/whatsapp.service";

@ApiTags("whatsapp")
@Controller("whatsapp")
export class WhatsAppController {
  constructor(
    private readonly service: WhatsAppService,
    private readonly audit: FellowshipAuditService,
  ) {}

  @Get("status")
  @AdminOnly()
  @ApiBearerAuth()
  async status() {
    return this.service.status();
  }

  @Post("connect")
  @AdminOnly()
  @ApiBearerAuth()
  async connect() {
    try {
      return await this.service.connect();
    } catch {
      throw new BadGatewayException(
        "Could not start the WhatsApp session. Check the API logs.",
      );
    }
  }

  @Post("logout")
  @AdminOnly()
  @ApiBearerAuth()
  async logout(@CurrentUser() user: SessionUser | null) {
    const result = await this.service.logout();
    await this.audit.log({
      actorEmail: user?.email,
      action: "whatsapp.logged_out",
      entityType: "whatsapp",
    });
    return result;
  }

  @Post("send")
  @AdminOnly()
  @ApiBearerAuth()
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  async send(
    @Body() body: SendWhatsAppDto,
    @CurrentUser() user: SessionUser | null,
  ) {
    try {
      const result = await this.service.sendText(body.to, body.message);
      await this.audit.log({
        actorEmail: user?.email,
        action: "whatsapp.sent",
        entityType: "whatsapp",
        detail: result.to,
      });
      return result;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not send WhatsApp message";
      if (message.includes("not connected")) {
        throw new ServiceUnavailableException(message);
      }
      throw new BadRequestException(message);
    }
  }
}
