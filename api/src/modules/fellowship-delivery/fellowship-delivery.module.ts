import { Module } from "@nestjs/common";

import { FellowshipAuditModule } from "@/modules/fellowship-audit/fellowship-audit.module";
import { FellowshipDeliveryController } from "@/modules/fellowship-delivery/fellowship-delivery.controller";
import { FellowshipDeliveryService } from "@/modules/fellowship-delivery/fellowship-delivery.service";

@Module({
  imports: [FellowshipAuditModule],
  controllers: [FellowshipDeliveryController],
  providers: [FellowshipDeliveryService],
})
export class FellowshipDeliveryModule {}
