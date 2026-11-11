import { Module } from "@nestjs/common";

import { StorageService } from "@/modules/upload/storage.service";
import { UploadController } from "@/modules/upload/upload.controller";

@Module({
  controllers: [UploadController],
  providers: [StorageService],
  exports: [StorageService],
})
export class UploadModule {}
