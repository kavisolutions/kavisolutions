import { Body, Controller, Delete, Get, Header, Logger, Param, Patch, Post, Query, ServiceUnavailableException } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

import { sendSurveyorRegisteredEmail } from "@/_shared/mailer";
import { AdminOnly, Public } from "@/auth/auth.decorators";
import { CurrentUser } from "@/auth/auth.guard";
import type { SessionUser } from "@/auth/auth.types";
import { SettingsService } from "@/modules/settings/settings.service";
import { RegisterSurveyorDto, UpdateSurveyorDto } from "@/modules/surveyors/dto/surveyor.dto";
import { SurveyorsService } from "@/modules/surveyors/surveyors.service";

@ApiTags("surveyors")
@Controller("surveyors")
export class SurveyorsController {
  private readonly logger = new Logger(SurveyorsController.name);

  constructor(
    private readonly service: SurveyorsService,
    private readonly settings: SettingsService,
  ) {}

  /* Public registration from the survey page. The record is stored first: a
     mail outage must not lose a surveyor who took the time to sign up. */
  @Post("register")
  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  async register(@Body() body: RegisterSurveyorDto) {
    const { surveyor } = await this.service.register(body);

    try {
      const to = await this.settings.contactEmail();
      await sendSurveyorRegisteredEmail({ ...surveyor, to });
    } catch (error) {
      // Registration succeeded; only the notification failed.
      this.logger.error(
        `Surveyor notification mail failed for ${surveyor.id}: ${
          error instanceof Error ? error.message : "unknown error"
        }`,
      );
    }

    return { success: true, surveyor };
  }

  @Get()
  @AdminOnly()
  @ApiBearerAuth()
  async list(@Query("status") status?: string, @Query("search") search?: string) {
    return this.service.list({ status, search });
  }

  @Patch(":id")
  @AdminOnly()
  @ApiBearerAuth()
  async update(
    @Param("id") id: string,
    @Body() body: UpdateSurveyorDto,
    @CurrentUser() user: SessionUser | null,
  ) {
    return this.service.update(id, body, user?.email ?? "");
  }

  @Delete(":id")
  @AdminOnly()
  @ApiBearerAuth()
  async remove(@Param("id") id: string, @CurrentUser() user: SessionUser | null) {
    return this.service.remove(id, user?.email ?? "");
  }

  @Get("export.csv")
  @AdminOnly()
  @ApiBearerAuth()
  @Header("Content-Type", "text/csv; charset=utf-8")
  @Header("Content-Disposition", 'attachment; filename="surveyors.csv"')
  async exportCsv(@Query("status") status?: string, @Query("search") search?: string) {
    return this.service.exportCsv({ status, search });
  }

  @Get(":id/audit")
  @AdminOnly()
  @ApiBearerAuth()
  async audit(@Param("id") id: string) {
    return this.service.listAudit(id);
  }

  /* Re-notify a surveyor whose confirmation email failed, without asking them
     to register again. */
  @Post(":id/resend")
  @AdminOnly()
  @ApiBearerAuth()
  async resend(@Param("id") id: string) {
    const surveyor = await this.service.findOne(id);

    try {
      const to = await this.settings.contactEmail();
      await sendSurveyorRegisteredEmail({
        id: surveyor.id,
        name: surveyor.name,
        email: surveyor.email,
        phone: surveyor.phone,
        location: surveyor.location,
        languages: surveyor.languages,
        skills: surveyor.skills,
        experience: surveyor.experience,
        status: surveyor.status,
        to,
      });
    } catch {
      throw new ServiceUnavailableException("Could not send the notification email");
    }

    return { ok: true };
  }
}
