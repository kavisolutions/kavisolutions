import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";

import { AuthModule } from "@/auth/auth.module";
import { AuthController } from "@/auth/auth.controller";
import { DrizzleModule } from "@/db/drizzle/drizzle.module";
import { AdminsModule } from "@/modules/admins/admins.module";
import { ContactModule } from "@/modules/contact/contact.module";
import { HealthModule } from "@/modules/health/health.module";
import { MeModule } from "@/modules/me/me.module";
import { ProjectsModule } from "@/modules/projects/projects.module";
import { RolesModule } from "@/modules/roles/roles.module";
import { SettingsModule } from "@/modules/settings/settings.module";
import { TeamModule } from "@/modules/team/team.module";
import { TeamsModule } from "@/modules/teams/teams.module";
import { UploadModule } from "@/modules/upload/upload.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 60 }]),
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
    UploadModule,
    ContactModule,
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
