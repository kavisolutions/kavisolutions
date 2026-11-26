import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";

import { sanitizeText } from "@/_shared/text";
import { AdminOnly, Public } from "@/auth/auth.decorators";
import { CurrentUser } from "@/auth/auth.guard";
import type { SessionUser } from "@/auth/auth.types";
import { LeadsService } from "@/modules/leads/leads.service";
import { FellowshipAutomationService } from "@/modules/fellowship-programme/fellowship-automation.service";
import { FellowshipProgrammeService } from "@/modules/fellowship-programme/fellowship-programme.service";

@ApiTags("fellowship-programme")
@Controller("fellowship-programme")
export class FellowshipProgrammeController {
  constructor(
    private readonly service: FellowshipProgrammeService,
    private readonly automation: FellowshipAutomationService,
    private readonly leads: LeadsService,
  ) {}

  @Get("dashboard")
  @AdminOnly()
  @ApiBearerAuth()
  async dashboard() {
    return this.service.dashboard();
  }

  @Get("admin/:resource")
  @AdminOnly()
  @ApiBearerAuth()
  async list(
    @Param("resource") resource: string,
    @Query("status") status?: string,
    @Query("q") q?: string,
    @Query("limit") limit?: string,
  ) {
    return this.service.list(resource, { status, q, limit });
  }

  @Post("admin/:resource")
  @AdminOnly()
  @ApiBearerAuth()
  async create(
    @Param("resource") resource: string,
    @Body() body: Record<string, unknown>,
    @CurrentUser() user: SessionUser | null,
  ) {
    return this.service.create(resource, body, { actorEmail: user?.email });
  }

  @Patch("admin/:resource/:id")
  @AdminOnly()
  @ApiBearerAuth()
  async update(
    @Param("resource") resource: string,
    @Param("id") id: string,
    @Body() body: Record<string, unknown>,
    @CurrentUser() user: SessionUser | null,
  ) {
    return this.service.update(resource, id, body, { actorEmail: user?.email });
  }

  @Delete("admin/:resource/:id")
  @AdminOnly()
  @ApiBearerAuth()
  async remove(
    @Param("resource") resource: string,
    @Param("id") id: string,
    @CurrentUser() user: SessionUser | null,
  ) {
    return this.service.remove(resource, id, user?.email);
  }

  @Post("stipends/generate")
  @AdminOnly()
  @ApiBearerAuth()
  async generateStipends(@Body() body: Record<string, unknown>) {
    return this.service.generateStipends(body);
  }

  @Post("automation/run")
  @AdminOnly()
  @ApiBearerAuth()
  async runAutomation() {
    return this.automation.runAll("manual");
  }

  @Get("public/faqs")
  @Public()
  async publicFaqs() {
    return this.service.publicFaqs();
  }

  @Post("public/inquiries")
  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  async publicInquiry(@Body() body: Record<string, unknown>) {
    return this.service.publicInquiry(body);
  }

  @Post("public/gurukulam-interests")
  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  async publicGurukulamInterest(@Body() body: Record<string, unknown>) {
    const result = await this.service.publicGurukulamInterest(body);

    await this.leads.captureBestEffort(
      {
        service: "gurukulam",
        kind: sanitizeText(body.kind, 60),
        name: sanitizeText(body.name, 160),
        email: sanitizeText(body.email, 254),
        phone: sanitizeText(body.phone, 40),
        organisation: sanitizeText(body.city, 120),
        subject: sanitizeText(body.kind, 60),
        message: [
          sanitizeText(body.background, 2000),
          sanitizeText(body.goal, 2000),
        ]
          .filter(Boolean)
          .join("\n\n"),
        reference: String(result.id),
        source: "/gurukulam",
      },
      "Gurukulam interest",
    );

    return result;
  }

  @Post("public/donation-pledges")
  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  async publicDonationPledge(@Body() body: Record<string, unknown>) {
    return this.service.publicDonationPledge(body);
  }
}
