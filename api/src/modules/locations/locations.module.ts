import { Module } from "@nestjs/common";

import { LocationsController } from "@/modules/locations/locations.controller";

@Module({
  controllers: [LocationsController],
})
export class LocationsModule {}
