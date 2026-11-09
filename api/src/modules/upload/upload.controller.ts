import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiBearerAuth, ApiConsumes, ApiTags } from "@nestjs/swagger";

import { CurrentUser } from "@/auth/auth.guard";
import type { SessionUser } from "@/auth/auth.types";
import { StorageService } from "@/modules/upload/storage.service";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 5 * 1024 * 1024;

@ApiTags("upload")
@Controller("upload")
@ApiBearerAuth()
export class UploadController {
  constructor(private readonly storage: StorageService) {}

  @Post()
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(FileInterceptor("file", { limits: { fileSize: MAX_SIZE } }))
  async upload(
    @UploadedFile() file: Express.Multer.File | undefined,
    @CurrentUser() user: SessionUser | null,
  ) {
    if (!user) throw new BadRequestException("Not authenticated");
    if (!file) throw new BadRequestException("No file provided");

    if (!ALLOWED_TYPES.includes(file.mimetype)) {
      throw new BadRequestException("Invalid file type. Allowed: jpg, png, webp, gif");
    }

    if (file.size > MAX_SIZE) {
      throw new BadRequestException("File too large. Max size: 5MB");
    }

    const ext = (file.originalname.split(".").pop() || "jpg").toLowerCase();
    const key = `${user.id}/${Date.now()}.${ext}`;
    const url = await this.storage.upload(key, file.buffer, file.mimetype);

    return { url };
  }
}
