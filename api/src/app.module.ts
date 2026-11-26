import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { ScheduleModule } from "@nestjs/schedule";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";

import { AuthModule } from "@/auth/auth.module";
import { AuthController } from "@/auth/auth.controller";
import { DrizzleModule } from "@/db/drizzle/drizzle.module";
import { AdminsModule } from "@/modules/admins/admins.module";
import { CertificatesModule } from "@/modules/certificates/certificates.module";
import { ContactModule } from "@/modules/contact/contact.module";
import { FarmsModule } from "@/modules/farms/farms.module";
import { FellowshipAlumniModule } from "@/modules/fellowship-alumni/fellowship-alumni.module";
import { FellowshipApplicationsModule } from "@/modules/fellowship-applications/fellowship-applications.module";
import { FellowshipAuditModule } from "@/modules/fellowship-audit/fellowship-audit.module";
import { FellowshipCasesModule } from "@/modules/fellowship-cases/fellowship-cases.module";
import { FellowshipDeliveryModule } from "@/modules/fellowship-delivery/fellowship-delivery.module";
import { FellowshipInterviewsModule } from "@/modules/fellowship-interviews/fellowship-interviews.module";
import { FellowshipMentorsModule } from "@/modules/fellowship-mentors/fellowship-mentors.module";
import { FellowshipOnboardingModule } from "@/modules/fellowship-onboarding/fellowship-onboarding.module";
import { FellowshipOperationsModule } from "@/modules/fellowship-operations/fellowship-operations.module";
import { FellowshipPolicyModule } from "@/modules/fellowship-policy/fellowship-policy.module";
import { FellowshipProgrammeModule } from "@/modules/fellowship-programme/fellowship-programme.module";
import { FellowshipReviewsModule } from "@/modules/fellowship-reviews/fellowship-reviews.module";
import { FellowshipTemplatesModule } from "@/modules/fellowship-templates/fellowship-templates.module";
import { FinancialModule } from "@/modules/financial/financial.module";
import { GovernmentModule } from "@/modules/government/government.module";
import { HealthModule } from "@/modules/health/health.module";
import { LeadsModule } from "@/modules/leads/leads.module";
import { LocationsModule } from "@/modules/locations/locations.module";
import { MeModule } from "@/modules/me/me.module";
import { PagesModule } from "@/modules/pages/pages.module";
import { ProjectsModule } from "@/modules/projects/projects.module";
import { RolesModule } from "@/modules/roles/roles.module";
import { SettingsModule } from "@/modules/settings/settings.module";
import { SocialModule } from "@/modules/social/social.module";
import { SurveyModule } from "@/modules/survey/survey.module";
import { SurveyorsModule } from "@/modules/surveyors/surveyors.module";
import { TeamModule } from "@/modules/team/team.module";
import { TeamsModule } from "@/modules/teams/teams.module";
import { UploadModule } from "@/modules/upload/upload.module";
import { WhatsAppModule } from "@/modules/whatsapp/whatsapp.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot({
      throttlers: [{ ttl: 60_000, limit: 60 }],
      // Only trust X-Real-IP from a loopback peer (nginx on the same host).
      // A client that reaches the API port directly can set any header value,
      // so accepting it unconditionally gives every attacker a fresh bucket.
      // X-Forwarded-For is never used: nginx appends to it, leaving a
      // client-controlled prefix in the first position.
      getTracker: (req: Record<string, any>) => {
        const peer = typeof req.ip === "string" ? req.ip : "";
        const loopback = peer === "127.0.0.1" || peer === "::1" || peer === "::ffff:127.0.0.1";
        if (loopback) {
          const realIp = req.headers?.["x-real-ip"];
          if (typeof realIp === "string" && realIp.trim()) return realIp.split(",")[0].trim();
        }
        return peer || "unknown";
      },
    }),
    ScheduleModule.forRoot(),
    DrizzleModule,
    AuthModule,
    HealthModule,
    TeamModule,
    MeModule,
    RolesModule,
    TeamsModule,
    AdminsModule,
    SettingsModule,
    ProjectsModule,
    CertificatesModule,
    UploadModule,
    ContactModule,
    LocationsModule,
    LeadsModule,
    SurveyModule,
    SurveyorsModule,
    FinancialModule,
    GovernmentModule,
    FellowshipApplicationsModule,
    FellowshipPolicyModule,
    FellowshipMentorsModule,
    FellowshipInterviewsModule,
    FellowshipOnboardingModule,
    FellowshipAlumniModule,
    FellowshipReviewsModule,
    FellowshipDeliveryModule,
    FellowshipCasesModule,
    FellowshipOperationsModule,
    FellowshipProgrammeModule,
    FellowshipAuditModule,
    FellowshipTemplatesModule,
    WhatsAppModule,
    FarmsModule,
    PagesModule,
    SocialModule,
  ],
  controllers: [AuthController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
