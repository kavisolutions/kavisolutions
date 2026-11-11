import { BadRequestException, Body, Controller, Logger, Post, ServiceUnavailableException } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { ApiTags } from "@nestjs/swagger";

import { sendFinancialEnquiryEmail } from "@/_shared/mailer";
import { sanitizeText } from "@/_shared/text";
import { Public } from "@/auth/auth.decorators";
import { CreateFinancialEnquiryDto } from "@/modules/financial/dto/financial-enquiry.dto";
import { SettingsService } from "@/modules/settings/settings.service";

@ApiTags("financial")
@Controller("financial")
export class FinancialController {
  private readonly logger = new Logger(FinancialController.name);

  constructor(private readonly settings: SettingsService) {}

  /* Public enquiry form on the financial services page. Throttled like the
     other public mail endpoints: this must not become a spam relay.

     Note that nothing here accepts documents. Financial paperwork is exchanged
     only after an engagement is agreed, so the form is a contact channel, not
     a document intake. */
  @Post("enquiries")
  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  async enquiry(@Body() body: CreateFinancialEnquiryDto) {
    const kind = body.kind;
    const name = sanitizeText(body.name, 120);
    const email = sanitizeText(body.email, 200);
    const phone = sanitizeText(body.phone, 30);
    const message = sanitizeText(body.message, 2000);

    if (!name || !email || !phone || !message) {
      throw new BadRequestException("Missing required fields");
    }

    if (kind === "individual" && (body.organisation || body.entityType)) {
      throw new BadRequestException("Unexpected fields for an individual enquiry");
    }
    if (kind === "business" && body.financialYear) {
      throw new BadRequestException("Unexpected fields for a business enquiry");
    }

    const to = await this.settings.contactEmail();

    try {
      await sendFinancialEnquiryEmail({
        kind,
        name,
        email,
        phone,
        organisation: sanitizeText(body.organisation, 160) || undefined,
        entityType: sanitizeText(body.entityType, 60) || undefined,
        service: sanitizeText(body.service, 120) || undefined,
        financialYear: sanitizeText(body.financialYear, 20) || undefined,
        message,
        to,
      });
    } catch (error) {
      // Never log the submitted personal data or financial details — only the
      // transport failure, so the inbox/notification can be retried.
      this.logger.error(
        `Financial enquiry mail failed (${kind}): ${
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
