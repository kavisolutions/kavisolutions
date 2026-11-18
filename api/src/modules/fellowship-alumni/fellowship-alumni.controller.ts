import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

import { AdminOnly } from "@/auth/auth.decorators";
import {
  CreateFellowshipAlumniDto,
  UpdateFellowshipAlumniDto,
} from "@/modules/fellowship-alumni/dto/fellowship-alumni.dto";
import { FellowshipAlumniService } from "@/modules/fellowship-alumni/fellowship-alumni.service";

@ApiTags("fellowship-alumni")
@Controller("fellowship-alumni")
export class FellowshipAlumniController {
  constructor(private readonly service: FellowshipAlumniService) {}

  @Get()
  @AdminOnly()
  @ApiBearerAuth()
  async list(@Query("search") search?: string, @Query("cohort") cohort?: string) {
    return this.service.list({ search, cohort });
  }

  @Post()
  @AdminOnly()
  @ApiBearerAuth()
  async create(@Body() body: CreateFellowshipAlumniDto) {
    return this.service.create(body);
  }

  @Patch(":id")
  @AdminOnly()
  @ApiBearerAuth()
  async update(@Param("id") id: string, @Body() body: UpdateFellowshipAlumniDto) {
    return this.service.update(id, body);
  }

  @Delete(":id")
  @AdminOnly()
  @ApiBearerAuth()
  async remove(@Param("id") id: string) {
    return this.service.remove(id);
  }
}
