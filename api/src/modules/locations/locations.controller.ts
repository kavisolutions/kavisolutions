import { Controller, Get } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

import { Public } from "@/auth/auth.decorators";
import { SURVEY_LOCATIONS } from "@/modules/locations/locations.data";

@ApiTags("locations")
@Controller("locations")
export class LocationsController {
  @Get()
  @Public()
  list() {
    return { locations: SURVEY_LOCATIONS };
  }
}
