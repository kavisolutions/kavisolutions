import { Module } from "@nestjs/common";

import { FellowshipMentorsController } from "@/modules/fellowship-mentors/fellowship-mentors.controller";
import { FellowshipMentorsService } from "@/modules/fellowship-mentors/fellowship-mentors.service";

@Module({
  controllers: [FellowshipMentorsController],
  providers: [FellowshipMentorsService],
})
export class FellowshipMentorsModule {}
