import { Body, Controller, Delete, Get, Logger, Param, Patch, Post, Query, ServiceUnavailableException } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

import { sendSurveyorRegisteredEmail } from "@/_shared/mailer";
import { AdminOnly, Public } from "@/auth/auth.decorators";
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
  async update(@Param("id") id: string, @Body() body: UpdateSurveyorDto) {
    return this.service.update(id, body);
  }

  @Delete(":id")
  @AdminOnly()
  @ApiBearerAuth()
  async remove(@Param("id") id: string) {
    return this.service.remove(id);
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
