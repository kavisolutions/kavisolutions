import { Module } from "@nestjs/common";

import { CertificatesController } from "@/modules/certificates/certificates.controller";
import { CertificatesService } from "@/modules/certificates/certificates.service";
import { UploadModule } from "@/modules/upload/upload.module";

@Module({
  imports: [UploadModule],
  controllers: [CertificatesController],
  providers: [CertificatesService],
})
export class CertificatesModule {}
