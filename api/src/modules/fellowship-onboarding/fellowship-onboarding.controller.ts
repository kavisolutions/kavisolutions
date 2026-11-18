import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiBearerAuth, ApiConsumes, ApiTags } from "@nestjs/swagger";

import { AdminOnly } from "@/auth/auth.decorators";
import { CurrentUser } from "@/auth/auth.guard";
import type { SessionUser } from "@/auth/auth.types";
import { FellowshipAuditService } from "@/modules/fellowship-audit/fellowship-audit.service";
import {
  UpdateFellowshipDocumentDto,
  UpsertFellowshipOnboardingDto,
} from "@/modules/fellowship-onboarding/dto/fellowship-onboarding.dto";
import { FellowshipDocumentsService } from "@/modules/fellowship-onboarding/fellowship-documents.service";
import { FellowshipOnboardingService } from "@/modules/fellowship-onboarding/fellowship-onboarding.service";

@ApiTags("fellowship-onboarding")
@Controller("fellowship-onboarding")
export class FellowshipOnboardingController {
  constructor(
    private readonly service: FellowshipOnboardingService,
    private readonly documents: FellowshipDocumentsService,
    private readonly audit: FellowshipAuditService,
  ) {}

  @Get()
  @AdminOnly()
  @ApiBearerAuth()
  async list() {
    return this.service.list();
  }

  @Get(":applicationId")
  @AdminOnly()
  @ApiBearerAuth()
  async get(@Param("applicationId") applicationId: string) {
    return this.service.get(applicationId);
  }

  @Put(":applicationId")
  @AdminOnly()
  @ApiBearerAuth()
  async upsert(
    @Param("applicationId") applicationId: string,
    @Body() body: UpsertFellowshipOnboardingDto,
    @CurrentUser() user: SessionUser | null,
  ) {
    const result = await this.service.upsert(applicationId, body);
    await this.audit.log({
      actorEmail: user?.email,
      action: "onboarding.saved",
      entityType: "application",
      entityId: applicationId,
      applicationId,
      detail: `${result.onboarding.completedItems}/${result.onboarding.totalItems}`,
    });
    return result;
  }

  @Get(":applicationId/documents")
  @AdminOnly()
  @ApiBearerAuth()
  async listDocuments(@Param("applicationId") applicationId: string) {
    return this.documents.list(applicationId);
  }

  @Post(":applicationId/documents")
  @AdminOnly()
  @ApiBearerAuth()
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(FileInterceptor("file", { limits: { fileSize: 10 * 1024 * 1024 } }))
  async uploadDocument(
    @Param("applicationId") applicationId: string,
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body() body: { type?: string; name?: string },
    @CurrentUser() user: SessionUser | null,
  ) {
    const result = await this.documents.upload(
      applicationId,
      file,
      body.type ?? "other",
      body.name ?? "",
      user?.email ?? "",
    );
    await this.audit.log({
      actorEmail: user?.email,
      action: "onboarding.document_uploaded",
      entityType: "document",
      entityId: result.document.id,
      applicationId,
      detail: result.document.name,
    });
    return result;
  }

  @Patch("documents/:id")
  @AdminOnly()
  @ApiBearerAuth()
  async updateDocument(
    @Param("id") id: string,
    @Body() body: UpdateFellowshipDocumentDto,
    @CurrentUser() user: SessionUser | null,
  ) {
    const result = await this.documents.update(id, body);
    await this.audit.log({
      actorEmail: user?.email,
      action: "onboarding.document_updated",
      entityType: "document",
      entityId: id,
      applicationId: result.document.applicationId,
      detail: result.document.status,
    });
    return result;
  }

  @Get("documents/:id/file")
  @AdminOnly()
  @ApiBearerAuth()
  async downloadDocument(@Param("id") id: string) {
    const { row, body } = await this.documents.download(id);
    return new StreamableFile(body, {
      type: row.mimeType,
      disposition: `attachment; filename="${row.name.replace(/"/g, "")}"`,
      length: body.length,
    });
  }

  @Delete("documents/:id")
  @AdminOnly()
  @ApiBearerAuth()
  async deleteDocument(@Param("id") id: string, @CurrentUser() user: SessionUser | null) {
    const result = await this.documents.remove(id);
    await this.audit.log({
      actorEmail: user?.email,
      action: "onboarding.document_deleted",
      entityType: "document",
      entityId: id,
    });
    return result;
  }
}
