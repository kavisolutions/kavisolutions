import { Module } from "@nestjs/common";

import { FellowshipAuditModule } from "@/modules/fellowship-audit/fellowship-audit.module";
import { FellowshipMentorsController } from "@/modules/fellowship-mentors/fellowship-mentors.controller";
import { FellowshipMentorsService } from "@/modules/fellowship-mentors/fellowship-mentors.service";

@Module({
  imports: [FellowshipAuditModule],
  controllers: [FellowshipMentorsController],
  providers: [FellowshipMentorsService],
})
export class FellowshipMentorsModule {}
