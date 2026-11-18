import { Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";

import {
  sendFellowshipAlumniFollowUpEmail,
  sendFellowshipInterviewCandidateEmail,
  sendFellowshipOfferReminderEmail,
} from "@/_shared/mailer";
import { env } from "@/config/env";
import { FellowshipAlumniService } from "@/modules/fellowship-alumni/fellowship-alumni.service";
import { FellowshipApplicationsService } from "@/modules/fellowship-applications/fellowship-applications.service";
import { FellowshipInterviewsService } from "@/modules/fellowship-interviews/fellowship-interviews.service";
import { WhatsAppService } from "@/modules/whatsapp/whatsapp.service";

@Injectable()
export class FellowshipAutomationService {
  private readonly logger = new Logger(FellowshipAutomationService.name);

  constructor(
    private readonly interviews: FellowshipInterviewsService,
    private readonly applications: FellowshipApplicationsService,
    private readonly alumni: FellowshipAlumniService,
    private readonly whatsapp: WhatsAppService,
  ) {}

  @Cron("0 6 * * *", { timeZone: "Asia/Kolkata" })
  async daily() {
    if (!env.FELLOWSHIP_AUTOMATION_ENABLED) return;
    const result = await this.runAll("cron");
    this.logger.log(
      `Fellowship reminders: interviews ${result.interviews.sent}/${result.interviews.due}, offers ${result.offers.sent}/${result.offers.due}, alumni ${result.alumni.sent}/${result.alumni.due}`,
    );
  }

  async runAll(trigger: "cron" | "manual") {
    const [interviews, offers, alumni] = await Promise.all([
      this.runInterviewReminders(),
      this.runOfferReminders(),
      this.runAlumniFollowUps(),
    ]);
    return { trigger, interviews, offers, alumni };
  }

  private async runInterviewReminders() {
    const { interviews } = await this.interviews.upcomingReminders(48);
    let sent = 0;
    for (const interview of interviews) {
      try {
        await sendFellowshipInterviewCandidateEmail({
          reference: interview.reference,
          candidateName: interview.candidateName,
          candidateEmail: interview.candidateEmail,
          scheduledAt: interview.scheduledAt,
          mode: interview.mode,
          location: interview.location,
          meetingUrl: interview.meetingUrl,
          interviewers: interview.panel.map((entry) => entry.name || entry.email),
          kind: "reminder",
          candidateToken: interview.candidateToken,
        });
        await this.interviews.markReminderSent(interview.id);
        sent += 1;
        await this.tryWhatsApp(
          interview.candidatePhone,
          `Kavi Fellowship interview reminder: ${this.when(interview.scheduledAt)} IST with ${interview.panel
            .map((entry) => entry.name)
            .join(", ")}. https://kavisolutions.in/fellowship/interview/${interview.candidateToken}`,
        );
      } catch (error) {
        this.logger.warn(
          `Interview reminder failed for ${interview.reference}: ${this.message(error)}`,
        );
      }
    }
    return { due: interviews.length, sent };
  }

  private async runOfferReminders() {
    const { applications } = await this.applications.dueOfferReminders(72);
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
        await this.applications.markOfferReminderSent(application.id);
        sent += 1;
        const expiry = application.offerExpiresAt
          ? this.when(application.offerExpiresAt)
          : "the deadline in your offer email";
        await this.tryWhatsApp(
          application.phone,
          `Kavi Fellowship: your offer (${application.reference}) expires ${expiry} IST.${
            application.candidateToken
              ? ` https://kavisolutions.in/fellowship/offer/${application.candidateToken}`
              : ""
          }`,
        );
      } catch (error) {
        this.logger.warn(
          `Offer reminder failed for ${application.reference}: ${this.message(error)}`,
        );
      }
    }
    return { due: applications.length, sent };
  }

  private async runAlumniFollowUps() {
    const { alumni } = await this.alumni.dueFollowUps();
    let sent = 0;
    for (const record of alumni) {
      try {
        await sendFellowshipAlumniFollowUpEmail({
          name: record.name,
          email: record.email,
          cohort: record.cohort,
          token: record.updateToken,
          kind: record.outcome6m ? "12m" : "6m",
        });
        await this.alumni.markFollowUpSent(record.id);
        sent += 1;
      } catch (error) {
        this.logger.warn(
          `Alumni follow-up failed for ${record.email}: ${this.message(error)}`,
        );
      }
    }
    return { due: alumni.length, sent };
  }

  private when(value: string): string {
    return new Date(value).toLocaleString("en-IN", {
      dateStyle: "full",
      timeStyle: "short",
      timeZone: "Asia/Kolkata",
    });
  }

  private async tryWhatsApp(phone: string, message: string) {
    try {
      await this.whatsapp.sendText(phone, message);
    } catch (error) {
      this.logger.warn(`WhatsApp reminder skipped: ${this.message(error)}`);
    }
  }

  private message(error: unknown): string {
    return error instanceof Error ? error.message : "unknown error";
  }
}
