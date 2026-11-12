import {
  BadRequestException,
  Body,
  Controller,
  Logger,
  Post,
  ServiceUnavailableException,
} from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { ApiTags } from "@nestjs/swagger";

import { sendGovernmentEnquiryEmail } from "@/_shared/mailer";
import { sanitizeText } from "@/_shared/text";
import { Public } from "@/auth/auth.decorators";
import { CreateGovernmentEnquiryDto } from "@/modules/government/dto/government-enquiry.dto";
import { SettingsService } from "@/modules/settings/settings.service";

@ApiTags("government")
@Controller("government")
export class GovernmentController {
  private readonly logger = new Logger(GovernmentController.name);

  constructor(private readonly settings: SettingsService) {}

  /* Public enquiry form behind the government page. Throttled like the other
     public mail endpoints so it cannot become a spam relay. */
  @Post("enquiries")
  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  async enquiry(@Body() body: CreateGovernmentEnquiryDto) {
    const name = sanitizeText(body.name, 120);
    const email = sanitizeText(body.email, 200);
    const phone = sanitizeText(body.phone, 30);
    const organisation = sanitizeText(body.organisation, 200);
    const message = sanitizeText(body.message, 2000);

    if (!name || !email || !phone || !organisation || !message) {
      throw new BadRequestException("Missing required fields");
    }

    const to = await this.settings.contactEmail();

    try {
      await sendGovernmentEnquiryEmail({
        name,
        email,
        phone,
        organisation,
        role: sanitizeText(body.role, 80) || undefined,
        portal: sanitizeText(body.portal, 200) || undefined,
        service: sanitizeText(body.service, 120) || undefined,
        message,
        to,
      });
    } catch (error) {
      // Never log the submission itself — only the transport failure.
      this.logger.error(
        `Government enquiry mail failed: ${
          error instanceof Error ? error.message : "unknown error"
        }`,
      );
      throw new ServiceUnavailableException(
        "Could not send your enquiry right now. Please email us directly.",
      );
    }

    return { success: true };
  }
}
