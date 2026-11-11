import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Res,
  StreamableFile,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import type { Response } from "express";

import { AdminOnly } from "@/auth/auth.decorators";
import {
  DraftMediaDto,
  ImportDriveMediaDto,
  UpdateMediaDto,
  UploadMediaDto,
} from "@/modules/social/dto/social.dto";
import { SocialService } from "@/modules/social/social.service";

@ApiTags("social")
@Controller("admin/social")
@AdminOnly()
@ApiBearerAuth()
export class SocialController {
  constructor(private readonly service: SocialService) {}

  @Get("status")
  async status() {
    return this.service.status();
  }

  @Get("accounts")
  async accounts() {
    return this.service.accounts();
  }

  @Get("media")
  async listMedia(
    @Query("from") from?: string,
    @Query("to") to?: string,
    @Query("status") status?: string,
  ) {
    return this.service.listMedia({ from, to, status });
  }

  @Post("media/import/drive")
  async importDrive(@Body() body: ImportDriveMediaDto) {
    return this.service.importDrive(body);
  }

  @Get("media/import/:jobId")
  async importJob(@Param("jobId") jobId: string) {
    return this.service.importJob(jobId);
  }

  @Post("media/upload")
  async upload(@Body() body: UploadMediaDto) {
    return this.service.upload(body);
  }

  @Post("media/run-due")
  async runDue() {
    return this.service.runDue();
  }

  @Patch("media/:id")
  async updateMedia(@Param("id", ParseIntPipe) id: number, @Body() body: UpdateMediaDto) {
    return this.service.updateMedia(id, body);
  }

  @Delete("media/:id")
  async removeMedia(@Param("id", ParseIntPipe) id: number) {
    return this.service.removeMedia(id);
  }

  @Post("media/:id/draft")
  async draftMedia(@Param("id", ParseIntPipe) id: number, @Body() body: DraftMediaDto) {
    return this.service.draftMedia(id, body);
  }

  /* Thumbnails are proxied so the admin page never needs the sidecar origin or
     token, and the sidecar can stay bound to 127.0.0.1. */
  @Get("media/:id/image")
  async mediaImage(
    @Param("id", ParseIntPipe) id: number,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { body, contentType } = await this.service.image(id);
    res.set({
      "Content-Type": contentType,
      "Cache-Control": "private, max-age=300",
      "Content-Length": String(body.byteLength),
    });
    return new StreamableFile(body);
  }

  @Get("posts")
  async posts() {
    return this.service.posts();
  }

  @Post("publish/:id")
  async publish(@Param("id", ParseIntPipe) id: number) {
    return this.service.publish(id);
  }
}
