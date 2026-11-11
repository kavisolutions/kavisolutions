import { Module } from "@nestjs/common";

import { CertificatesController } from "@/modules/certificates/certificates.controller";
import { CertificatesService } from "@/modules/certificates/certificates.service";

@Module({
  controllers: [CertificatesController],
  providers: [CertificatesService],
})
export class CertificatesModule {}
