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

import { sendFarmsEnquiryEmail } from "@/_shared/mailer";
import { sanitizeText } from "@/_shared/text";
import { Public } from "@/auth/auth.decorators";
import { CreateFarmsEnquiryDto } from "@/modules/farms/dto/farms-enquiry.dto";
import { SettingsService } from "@/modules/settings/settings.service";

@ApiTags("farms")
@Controller("farms")
export class FarmsController {
  private readonly logger = new Logger(FarmsController.name);

  constructor(private readonly settings: SettingsService) {}

  /* Public enquiry form behind the Kavi Farms page. Product and tourism
     enquiries share the endpoint; the controller enforces the field split. */
  @Post("enquiries")
  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  async enquiry(@Body() body: CreateFarmsEnquiryDto) {
    const kind = body.kind;
    const name = sanitizeText(body.name, 120);
    const email = sanitizeText(body.email, 200);
    const phone = sanitizeText(body.phone, 30);
    const message = sanitizeText(body.message, 2000);

    if (!name || !email || !phone || !message) {
      throw new BadRequestException("Missing required fields");
    }

    if (kind === "product" && (body.service || body.travelMonth || body.groupSize)) {
      throw new BadRequestException("Unexpected fields for a product enquiry");
    }
    if (kind === "tourism" && (body.product || body.quantity)) {
      throw new BadRequestException("Unexpected fields for a tourism enquiry");
    }

    const to = await this.settings.contactEmail();

    try {
      await sendFarmsEnquiryEmail({
        kind,
        name,
        email,
        phone,
        product: sanitizeText(body.product, 120) || undefined,
        quantity: sanitizeText(body.quantity, 80) || undefined,
        service: sanitizeText(body.service, 120) || undefined,
        travelMonth: sanitizeText(body.travelMonth, 40) || undefined,
        groupSize: sanitizeText(body.groupSize, 40) || undefined,
        message,
        to,
      });
    } catch (error) {
      this.logger.error(
        `Farms enquiry mail failed (${kind}): ${
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
