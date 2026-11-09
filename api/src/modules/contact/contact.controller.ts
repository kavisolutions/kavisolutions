import { BadRequestException, Body, Controller, Post } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { ApiTags } from "@nestjs/swagger";

import { Public } from "@/auth/auth.decorators";
import { sendContactEmail } from "@/_shared/mailer";
import { SettingsService } from "@/modules/settings/settings.service";

type ContactBody = {
  name?: string;
  email?: string;
  phone?: string;
  service?: string;
  message?: string;
};

@ApiTags("contact")
@Controller("contact")
export class ContactController {
  constructor(private readonly settings: SettingsService) {}

  @Post()
  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  async send(@Body() body: ContactBody) {
    const name = (body?.name || "").trim();
    const email = (body?.email || "").trim();
    const phone = (body?.phone || "").trim();
    const service = (body?.service || "").trim();
    const message = (body?.message || "").trim();

    if (!name || !email || !phone || !message) {
      throw new BadRequestException("Missing required fields");
    }

    const to = await this.settings.contactEmail();

    await sendContactEmail({ name, email, phone, service, message, to });

    return { success: true };
  }
}
