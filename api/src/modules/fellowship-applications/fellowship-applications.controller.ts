import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Logger,
  Param,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

import {
  sendFellowshipApplicationConfirmationEmail,
  sendFellowshipApplicationEmail,
  sendFellowshipOfferDecisionEmail,
  sendFellowshipOfferReminderEmail,
  sendFellowshipStageUpdateEmail,
  sendFellowshipTemplateEmail,
} from "@/_shared/mailer";
import { AdminOnly, Public } from "@/auth/auth.decorators";
import { CurrentUser } from "@/auth/auth.guard";
import type { SessionUser } from "@/auth/auth.types";
import { FellowshipAuditService } from "@/modules/fellowship-audit/fellowship-audit.service";
import { SettingsService } from "@/modules/settings/settings.service";
import {
  BulkUpdateFellowshipApplicationsDto,
  CreateFellowshipApplicationDto,
  FellowshipApplicationStatusDto,
  FellowshipOfferResponseDto,
  UpdateFellowshipApplicationDto,
} from "@/modules/fellowship-applications/dto/fellowship-application.dto";
import { FellowshipApplicationsService } from "@/modules/fellowship-applications/fellowship-applications.service";
import type { FellowshipApplicationAdminDto } from "@/modules/fellowship-applications/fellowship-applications.service";
import { FellowshipTemplatesService } from "@/modules/fellowship-templates/fellowship-templates.service";
import { WhatsAppService } from "@/modules/whatsapp/whatsapp.service";

@ApiTags("fellowship-applications")
@Controller("fellowship-applications")
export class FellowshipApplicationsController {
  private readonly logger = new Logger(FellowshipApplicationsController.name);

  constructor(
    private readonly service: FellowshipApplicationsService,
    private readonly settings: SettingsService,
    private readonly audit: FellowshipAuditService,
    private readonly templates: FellowshipTemplatesService,
    private readonly whatsapp: WhatsAppService,
  ) {}

  @Post()
  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  async submit(@Body() body: CreateFellowshipApplicationDto) {
    const application = await this.service.submit(body);

    try {
      const to = await this.settings.contactEmail();
      await sendFellowshipApplicationEmail({
        reference: application.reference,
        name: application.name,
        email: application.email,
        phone: body.phone,
        city: application.city,
        candidateStatus: body.candidateStatus ?? "",
        track: application.track,
        motivation: body.motivation,
        cohort: application.cohort,
        to,
      });
      await sendFellowshipApplicationConfirmationEmail(application);
    } catch (error) {
      // Stored successfully; only mail failed.
      this.logger.error(
        `Fellowship application mail failed for ${application.reference}: ${
          error instanceof Error ? error.message : "unknown error"
        }`,
      );
    }

    return { success: true, application };
  }

  @Post("status")
  @Public()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  async status(@Body() body: FellowshipApplicationStatusDto) {
    return { application: await this.service.status(body) };
  }

  @Get("offer/:token")
  @Public()
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  async candidateOffer(@Param("token") token: string) {
    return this.service.findByCandidateToken(token);
  }

  @Post("offer/:token")
  @Public()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  async respondToOffer(
    @Param("token") token: string,
    @Body() body: FellowshipOfferResponseDto,
  ) {
    const result = await this.service.respondToOffer(token, body.decision);

    try {
      const to = await this.settings.contactEmail();
      await sendFellowshipOfferDecisionEmail({
        reference: result.application.reference,
        name: result.application.name,
        email: result.application.email,
        track: result.application.track,
        cohort: result.application.cohort,
        decision: body.decision === "accept" ? "accepted" : "declined",
        to,
      });
    } catch (error) {
      this.logger.error(
        `Fellowship offer decision mail failed for ${result.application.reference}: ${
          error instanceof Error ? error.message : "unknown error"
        }`,
      );
    }

    await this.audit.log({
      actorEmail: result.application.email,
      action: "offer.response",
      entityType: "application",
      entityId: result.application.id,
      applicationId: result.application.id,
      detail: body.decision,
    });

    return { application: result.application };
  }

  @Get()
  @AdminOnly()
  @ApiBearerAuth()
  async list(@Query("stage") stage?: string, @Query("search") search?: string) {
    return this.service.list({ stage, search });
  }

  @Get("export.csv")
  @AdminOnly()
  @ApiBearerAuth()
  @Header("Content-Type", "text/csv; charset=utf-8")
  @Header("Content-Disposition", 'attachment; filename="fellowship-applications.csv"')
  async exportCsv(
    @Query("stage") stage?: string,
    @Query("search") search?: string,
  ) {
    return this.service.exportCsv({ stage, search });
  }

  @Get("offers/due")
  @AdminOnly()
  @ApiBearerAuth()
  async dueOffers() {
    return this.service.dueOfferReminders(72);
  }

  @Post("offers/reminders/run")
  @AdminOnly()
  @ApiBearerAuth()
  async runOfferReminders(@CurrentUser() user: SessionUser | null) {
    const { applications } = await this.service.dueOfferReminders(72);
    let sent = 0;
    for (const application of applications) {
      try {
        await sendFellowshipOfferReminderEmail({
          reference: application.reference,
          name: application.name,
          email: application.email,
          track: application.track,
          cohort: application.cohort,
          offerExpiresAt: application.offerExpiresAt as string,
          candidateToken: application.candidateToken,
        });
        await this.service.markOfferReminderSent(application.id);
        sent += 1;

        try {
          const expiry = application.offerExpiresAt
            ? new Date(application.offerExpiresAt).toLocaleString("en-IN", {
                dateStyle: "full",
                timeStyle: "short",
                timeZone: "Asia/Kolkata",
              })
            : "the deadline in your offer email";
          const offerUrl = application.candidateToken
            ? ` https://kavisolutions.in/fellowship/offer/${application.candidateToken}`
            : "";
          await this.whatsapp.sendText(
            application.phone,
            `Kavi Fellowship: your offer (${application.reference}) expires ${expiry} IST.${offerUrl}`,
          );
        } catch (error) {
          this.logger.warn(
            `Offer WhatsApp reminder skipped for ${application.reference}: ${
              error instanceof Error ? error.message : "unknown error"
            }`,
          );
        }
      } catch (error) {
        this.logger.error(
          `Offer reminder failed for ${application.reference}: ${
            error instanceof Error ? error.message : "unknown error"
          }`,
        );
      }
    }
    await this.audit.log({
      actorEmail: user?.email,
      action: "offers.reminders_run",
      entityType: "application",
      detail: `Sent ${sent}`,
    });
    return { sent };
  }

  @Patch("bulk")
  @AdminOnly()
  @ApiBearerAuth()
  async bulk(
    @Body() body: BulkUpdateFellowshipApplicationsDto,
    @CurrentUser() user: SessionUser | null,
  ) {
    const result = await this.service.bulkUpdate(body);

    for (const application of result.changedApplications) {
      await this.notifyStage(application);
    }

    await this.audit.log({
      actorEmail: user?.email,
      action: "applications.bulk_stage",
      entityType: "application",
      detail: `${result.changed} application(s) moved to ${body.stage}`,
    });

    return { applications: result.applications, changed: result.changed };
  }

  @Patch(":id")
  @AdminOnly()
  @ApiBearerAuth()
  async update(
    @Param("id") id: string,
    @Body() body: UpdateFellowshipApplicationDto,
    @CurrentUser() user: SessionUser | null,
  ) {
    const result = await this.service.update(id, body);

    if (result.stageChanged) {
      await this.notifyStage(result.application);
    }

    await this.audit.log({
      actorEmail: user?.email,
      action: "application.stage_updated",
      entityType: "application",
      entityId: id,
      applicationId: id,
      detail: `${result.previousStage} -> ${result.application.stage}`,
    });

    return { application: result.application };
  }

  @Delete(":id")
  @AdminOnly()
  @ApiBearerAuth()
  async remove(@Param("id") id: string, @CurrentUser() user: SessionUser | null) {
    const result = await this.service.remove(id);
    await this.audit.log({
      actorEmail: user?.email,
      action: "application.deleted",
      entityType: "application",
      entityId: id,
      applicationId: id,
    });
    return result;
  }

  private async notifyStage(application: FellowshipApplicationAdminDto): Promise<void> {
    try {
      const template = await this.templates.find(`stage.${application.stage}`);
      if (template?.subject && template.body) {
        const offerExpiry = application.offerExpiresAt
          ? new Date(application.offerExpiresAt).toLocaleString("en-IN", {
              dateStyle: "full",
              timeStyle: "short",
              timeZone: "Asia/Kolkata",
            })
          : "";
        const offerUrl = application.candidateToken
          ? `https://kavisolutions.in/fellowship/offer/${application.candidateToken}`
          : "";
        const variables: Record<string, string> = {
          name: application.name,
          reference: application.reference,
          track: application.track,
          cohort: application.cohort,
          stage: application.stage,
          offerExpiry,
          offerUrl,
        };
        const render = (value: string): string =>
          value.replace(
            /\{\{(\w+)\}\}/g,
            (_match, key: string) => variables[key] ?? "",
          );
        await sendFellowshipTemplateEmail({
          to: application.email,
          subject: render(template.subject),
          body: render(template.body),
        });
        return;
      }

      await sendFellowshipStageUpdateEmail({
        reference: application.reference,
        name: application.name,
        email: application.email,
        track: application.track,
        cohort: application.cohort,
        stage: application.stage,
        offerExpiresAt: application.offerExpiresAt,
        candidateToken: application.candidateToken,
      });
    } catch (error) {
      this.logger.error(
        `Fellowship stage email failed for ${application.reference}: ${
          error instanceof Error ? error.message : "unknown error"
        }`,
      );
    }
  }
}
