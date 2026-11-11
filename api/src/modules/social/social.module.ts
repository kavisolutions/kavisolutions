import { Module } from "@nestjs/common";

import { SocialController } from "@/modules/social/social.controller";
import { SocialService } from "@/modules/social/social.service";

@Module({
  controllers: [SocialController],
  providers: [SocialService],
  exports: [SocialService],
})
export class SocialModule {}
