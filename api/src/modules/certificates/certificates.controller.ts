import { Body, Controller, Delete, Get, Header, NotFoundException, Param, Post, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

import { isCertificateId, normalizeCertificateId } from "@/_shared/certificates";
import { AdminOnly, Public } from "@/auth/auth.decorators";
import {
  CertificateIdDto,
  CreateCertificateDto,
  ReinstateCertificateDto,
  RevokeCertificateDto,
} from "@/modules/certificates/dto/certificate.dto";
import { CertificatesService } from "@/modules/certificates/certificates.service";

@ApiTags("certificates")
@Controller("certificates")
export class CertificatesController {
  constructor(private readonly service: CertificatesService) {}

  /* Public endpoint behind the QR code on every printed certificate.
     Unknown IDs return 404 with a constant body — no recipient data leaks.
     Deliberately uncached: revocation has to take effect immediately, and a
     cached "valid" answer for a revoked certificate is worse than a re-fetch. */
  @Get(":id")
  @Public()
  @Header("Cache-Control", "no-store")
  async verify(@Param("id") id: string) {
    // Express has already percent-decoded the route segment. Decoding again
    // throws on a literal "%" (e.g. /certificates/%25) and would 500.
    const normalized = normalizeCertificateId(id);

    if (!isCertificateId(normalized)) {
      throw new NotFoundException("Certificate not found");
    }

    const certificate = await this.service.verify(normalized);
    if (!certificate) throw new NotFoundException("Certificate not found");

    return { certificate };
  }

  @Get()
  @AdminOnly()
  @ApiBearerAuth()
  async list(@Query("includeDeleted") includeDeleted?: string) {
    return this.service.list({ includeDeleted: includeDeleted === "true" });
  }

  @Post()
  @AdminOnly()
  @ApiBearerAuth()
  async create(@Body() body: CreateCertificateDto) {
    return this.service.create(body);
  }

  @Post("revoke")
  @AdminOnly()
  @ApiBearerAuth()
  async revoke(@Body() body: RevokeCertificateDto) {
    return this.service.revoke(body);
  }

  @Post("reinstate")
  @AdminOnly()
  @ApiBearerAuth()
  async reinstate(@Body() body: ReinstateCertificateDto) {
    return this.service.reinstate(body);
  }

  /* Soft delete — the record is hidden and stops verifying, but is recoverable. */
  @Delete()
  @AdminOnly()
  @ApiBearerAuth()
  async remove(@Query() query: CertificateIdDto) {
    return this.service.remove(query);
  }

  @Post("restore")
  @AdminOnly()
  @ApiBearerAuth()
  async restore(@Body() body: CertificateIdDto) {
    return this.service.restore(body);
  }
}
