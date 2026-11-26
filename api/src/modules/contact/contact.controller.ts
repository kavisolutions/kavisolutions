import { BadRequestException, Body, Controller, Post } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { ApiTags } from "@nestjs/swagger";

import { Public } from "@/auth/auth.decorators";
import { sendContactEmail } from "@/_shared/mailer";
import { SendContactDto } from "@/modules/contact/dto/contact.dto";
import { LeadsService } from "@/modules/leads/leads.service";
import { SettingsService } from "@/modules/settings/settings.service";

@ApiTags("contact")
@Controller("contact")
export class ContactController {
  constructor(
    private readonly settings: SettingsService,
    private readonly leads: LeadsService,
  ) {}

  @Post()
  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  async send(@Body() body: SendContactDto) {
    const name = body.name.trim();
    const email = body.email.trim();
    const phone = body.phone.trim();
    const service = (body.service ?? "").trim();
    const message = body.message.trim();

    if (!name || !email || !phone || !message) {
      throw new BadRequestException("Missing required fields");
    }

    await this.leads.captureBestEffort(
      {
        service: "contact",
        name,
        email,
        phone,
        subject: service,
        message,
        source: "/contact",
      },
      "Contact enquiry",
    );

    const to = await this.settings.contactEmail();

    await sendContactEmail({ name, email, phone, service, message, to });

    return { success: true };
  }
}
