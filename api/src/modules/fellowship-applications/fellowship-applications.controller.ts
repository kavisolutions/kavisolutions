import {
  Body,
  Controller,
  Get,
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
  sendFellowshipStageUpdateEmail,
} from "@/_shared/mailer";
import { AdminOnly, Public } from "@/auth/auth.decorators";
import { SettingsService } from "@/modules/settings/settings.service";
import {
  CreateFellowshipApplicationDto,
  FellowshipApplicationStatusDto,
  UpdateFellowshipApplicationDto,
} from "@/modules/fellowship-applications/dto/fellowship-application.dto";
import { FellowshipApplicationsService } from "@/modules/fellowship-applications/fellowship-applications.service";

@ApiTags("fellowship-applications")
@Controller("fellowship-applications")
export class FellowshipApplicationsController {
  private readonly logger = new Logger(FellowshipApplicationsController.name);

  constructor(
    private readonly service: FellowshipApplicationsService,
    private readonly settings: SettingsService,
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

  @Get()
  @AdminOnly()
  @ApiBearerAuth()
  async list(@Query("stage") stage?: string, @Query("search") search?: string) {
    return this.service.list({ stage, search });
  }

  @Patch(":id")
  @AdminOnly()
  @ApiBearerAuth()
  async update(@Param("id") id: string, @Body() body: UpdateFellowshipApplicationDto) {
    const result = await this.service.update(id, body);

    if (result.stageChanged) {
      try {
        await sendFellowshipStageUpdateEmail({
          reference: result.application.reference,
          name: result.application.name,
          email: result.application.email,
          track: result.application.track,
          cohort: result.application.cohort,
          stage: result.application.stage,
        });
      } catch (error) {
        this.logger.error(
          `Fellowship stage email failed for ${result.application.reference}: ${
            error instanceof Error ? error.message : "unknown error"
          }`,
        );
      }
    }

    return { application: result.application };
  }
}
