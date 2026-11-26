import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Param,
  Patch,
  Query,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

import { AdminOnly } from "@/auth/auth.decorators";
import { UpdateLeadDto } from "@/modules/leads/dto/update-lead.dto";
import { LeadsService } from "@/modules/leads/leads.service";

@ApiTags("leads")
@AdminOnly()
@ApiBearerAuth()
@Controller("leads")
export class LeadsController {
  constructor(private readonly service: LeadsService) {}

  @Get()
  async list(
    @Query("service") service?: string,
    @Query("status") status?: string,
    @Query("search") search?: string,
  ) {
    return this.service.list({ service, status, search });
  }

  @Get("export.csv")
  @Header("Content-Type", "text/csv; charset=utf-8")
  @Header("Content-Disposition", 'attachment; filename="kavi-leads.csv"')
  async export(
    @Query("service") service?: string,
    @Query("status") status?: string,
    @Query("search") search?: string,
  ) {
    return this.service.exportCsv({ service, status, search });
  }

  @Patch(":id")
  async update(@Param("id") id: string, @Body() body: UpdateLeadDto) {
    return { lead: await this.service.update(id, body) };
  }

  @Delete(":id")
  async remove(@Param("id") id: string) {
    return this.service.remove(id);
  }
}
