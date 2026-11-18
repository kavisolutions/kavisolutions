import { Module } from "@nestjs/common";

import { FellowshipAuditModule } from "@/modules/fellowship-audit/fellowship-audit.module";
import { FellowshipReviewsController } from "@/modules/fellowship-reviews/fellowship-reviews.controller";
import { FellowshipReviewsService } from "@/modules/fellowship-reviews/fellowship-reviews.service";

@Module({
  imports: [FellowshipAuditModule],
  controllers: [FellowshipReviewsController],
  providers: [FellowshipReviewsService],
})
export class FellowshipReviewsModule {}
