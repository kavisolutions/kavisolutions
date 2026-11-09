import { Body, Controller, Delete, Get, Patch, Post, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

import { AdminOnly, Public } from "@/auth/auth.decorators";
import { CreateProjectDto, UpdateProjectDto } from "@/modules/projects/dto/project.dto";
import { ProjectsService } from "@/modules/projects/projects.service";

@ApiTags("projects")
@Controller("projects")
export class ProjectsController {
  constructor(private readonly service: ProjectsService) {}

  @Get()
  @Public()
  async list() {
    return this.service.list();
  }

  @Post()
  @AdminOnly()
  @ApiBearerAuth()
  async create(@Body() body: CreateProjectDto) {
    return this.service.create(body);
  }

  @Patch()
  @AdminOnly()
  @ApiBearerAuth()
  async update(@Body() body: UpdateProjectDto) {
    return this.service.update(body);
  }

  @Delete()
  @AdminOnly()
  @ApiBearerAuth()
  async remove(@Query("id") id: string) {
    return this.service.remove(id);
  }
}
