import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Logger,
  Param,
  Patch,
  Post,
  Put,
  Query,
  ServiceUnavailableException,
} from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

import { sendSurveyEnquiryEmail } from "@/_shared/mailer";
import { sanitizeText } from "@/_shared/text";
import { AdminOnly, Public } from "@/auth/auth.decorators";
import { CreateSurveyEnquiryDto } from "@/modules/survey/dto/survey-enquiry.dto";
import { UpdateSurveyEnquiryDto } from "@/modules/survey/dto/update-survey-enquiry.dto";
import { SurveyService } from "@/modules/survey/survey.service";
import { SettingsService } from "@/modules/settings/settings.service";

@ApiTags("survey")
@Controller("survey")
export class SurveyController {
  private readonly logger = new Logger(SurveyController.name);

  constructor(
    private readonly settings: SettingsService,
    private readonly service: SurveyService,
  ) {}

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

    /* Store first. A mail outage must not lose a project enquiry, and the
       admin inbox is the durable record. Surveyor signups use /surveyors. */
    let stored = false;
    if (kind === "client") {
      try {
        await this.service.createClient(body);
        stored = true;
      } catch (error) {
        this.logger.error(
          `Survey enquiry could not be stored: ${
            error instanceof Error ? error.message : "unknown error"
          }`,
        );
      }
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

      /* If the lead is safely in the admin inbox, do not tell the visitor the
         submission failed and make them send it twice. */
      if (stored) return { success: true, notified: false };

      throw new ServiceUnavailableException(
        "Could not send your enquiry right now. Please email us directly.",
      );
    }

    return { success: true };
  }

  /* The standalone survey frontend reads and writes its content through the
     main API, so the survey service owns no database of its own. */
  @Get("content")
  @Public()
  async content() {
    return { content: await this.service.getContent() };
  }

  @Put("content")
  @AdminOnly()
  @ApiBearerAuth()
  async saveContent(@Body() body: unknown) {
    return { content: await this.service.saveContent(body) };
  }

  /* Internal leads. Admin-only: never expose connections under discussion
     on the public site or to unauthenticated API callers. */
  @Get("opportunities")
  @AdminOnly()
  @ApiBearerAuth()
  async opportunities() {
    return { opportunities: await this.settings.surveyOpportunities() };
  }

  @Get("enquiries")
  @AdminOnly()
  @ApiBearerAuth()
  async listEnquiries(@Query("status") status?: string, @Query("search") search?: string) {
    return this.service.listEnquiries({ status, search });
  }

  @Get("enquiries/export.csv")
  @AdminOnly()
  @ApiBearerAuth()
  @Header("Content-Type", "text/csv; charset=utf-8")
  @Header("Content-Disposition", 'attachment; filename="survey-enquiries.csv"')
  async exportEnquiries() {
    return this.service.exportCsv();
  }

  @Patch("enquiries/:id")
  @AdminOnly()
  @ApiBearerAuth()
  async updateEnquiry(@Param("id") id: string, @Body() body: UpdateSurveyEnquiryDto) {
    return this.service.updateEnquiry(id, body);
  }

  @Delete("enquiries/:id")
  @AdminOnly()
  @ApiBearerAuth()
  async removeEnquiry(@Param("id") id: string) {
    return this.service.removeEnquiry(id);
  }
}
