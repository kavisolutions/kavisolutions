import { BadRequestException, Body, Controller, Logger, Post, ServiceUnavailableException } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { ApiTags } from "@nestjs/swagger";

import { sendSurveyEnquiryEmail } from "@/_shared/mailer";
import { sanitizeText } from "@/_shared/text";
import { Public } from "@/auth/auth.decorators";
import { CreateSurveyEnquiryDto } from "@/modules/survey/dto/survey-enquiry.dto";
import { SettingsService } from "@/modules/settings/settings.service";

@ApiTags("survey")
@Controller("survey")
export class SurveyController {
  private readonly logger = new Logger(SurveyController.name);

  constructor(private readonly settings: SettingsService) {}

  /* Public form behind the survey page. Same throttle budget as /contact:
     this is an unauthenticated mail relay and must not become a spam vector. */
  @Post("enquiries")
  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  async enquiry(@Body() body: CreateSurveyEnquiryDto) {
    const kind = body.kind;
    const name = sanitizeText(body.name, 120);
    const email = sanitizeText(body.email, 200);
    const phone = sanitizeText(body.phone, 30);
    const message = sanitizeText(body.message, 2000);

    if (!name || !email || !phone || !message) {
      throw new BadRequestException("Missing required fields");
    }

    // Surveyor-only and client-only fields must not cross over.
    if (kind === "client" && (body.location || body.languages || body.experience)) {
      throw new BadRequestException("Unexpected fields for a client enquiry");
    }
    if (kind === "surveyor" && (body.organisation || body.service)) {
      throw new BadRequestException("Unexpected fields for a surveyor registration");
    }

    const to = await this.settings.contactEmail();

    try {
      await sendSurveyEnquiryEmail({
        kind,
        name,
        email,
        phone,
        organisation: sanitizeText(body.organisation, 160) || undefined,
        service: sanitizeText(body.service, 120) || undefined,
        location: sanitizeText(body.location, 120) || undefined,
        languages: sanitizeText(body.languages, 160) || undefined,
        experience: sanitizeText(body.experience, 160) || undefined,
        message,
        to,
      });
    } catch (error) {
      // An SMTP outage must not surface as an opaque 500 to the visitor, and we
      // never log the submitted personal data — only the transport failure.
      this.logger.error(
        `Survey enquiry mail failed (${kind}): ${error instanceof Error ? error.message : "unknown error"}`,
      );
      throw new ServiceUnavailableException(
        "Could not send your enquiry right now. Please email us directly.",
      );
    }

    return { success: true };
  }
}
