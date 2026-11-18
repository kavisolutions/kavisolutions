import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

import { AdminOnly } from "@/auth/auth.decorators";
import {
  CreateFellowshipMentorDto,
  UpdateFellowshipMentorDto,
} from "@/modules/fellowship-mentors/dto/fellowship-mentor.dto";
import { FellowshipMentorsService } from "@/modules/fellowship-mentors/fellowship-mentors.service";

@ApiTags("fellowship-mentors")
@Controller("fellowship-mentors")
export class FellowshipMentorsController {
  constructor(private readonly service: FellowshipMentorsService) {}

  @Get()
  @AdminOnly()
  @ApiBearerAuth()
  async list(@Query("status") status?: string) {
    return this.service.list({ status });
  }

  @Post()
  @AdminOnly()
  @ApiBearerAuth()
  async create(@Body() body: CreateFellowshipMentorDto) {
    return { mentor: await this.service.create(body) };
  }

  @Patch(":id")
  @AdminOnly()
  @ApiBearerAuth()
  async update(@Param("id") id: string, @Body() body: UpdateFellowshipMentorDto) {
    return { mentor: await this.service.update(id, body) };
  }

  @Delete(":id")
  @AdminOnly()
  @ApiBearerAuth()
  async remove(@Param("id") id: string) {
    return this.service.remove(id);
  }
}
