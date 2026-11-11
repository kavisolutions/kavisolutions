import { Body, Controller, Get, Header, NotFoundException, Param, Post, Query, Res, StreamableFile, UploadedFile, UseInterceptors, BadRequestException, Delete } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiBearerAuth, ApiConsumes, ApiTags } from "@nestjs/swagger";
import type { Response } from "express";

import { isCertificateId, normalizeCertificateId } from "@/_shared/certificates";
import { AdminOnly, Public } from "@/auth/auth.decorators";
import {
  CertificateIdDto,
  CreateCertificateDto,
  ReinstateCertificateDto,
  RevokeCertificateDto,
} from "@/modules/certificates/dto/certificate.dto";
import { CertificatesService } from "@/modules/certificates/certificates.service";

const MAX_PDF_SIZE = 10 * 1024 * 1024;

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

  /* --- PDF in the private bucket ----------------------------------------- */

  @Post(":id/pdf")
  @AdminOnly()
  @ApiBearerAuth()
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(FileInterceptor("file", { limits: { fileSize: MAX_PDF_SIZE } }))
  async uploadPdf(
    @Param("id") id: string,
    @UploadedFile() file: Express.Multer.File | undefined,
  ) {
    if (!file) throw new BadRequestException("No file provided");

    const isPdf =
      file.mimetype === "application/pdf" ||
      file.originalname.toLowerCase().endsWith(".pdf");
    if (!isPdf) throw new BadRequestException("Only PDF files are accepted");
    if (file.size > MAX_PDF_SIZE) {
      throw new BadRequestException(`PDF too large. Max size: ${MAX_PDF_SIZE / 1024 / 1024}MB`);
    }

    return this.service.attachPdf(id, {
      buffer: file.buffer,
      originalname: file.originalname,
    });
  }

  /* Public download by certificate ID. The bucket is private, so this route is
     the only way to fetch the file — it streams the bytes and never exposes the
     object key or a bucket URL. */
  @Get(":id/pdf")
  @Public()
  async downloadPdf(@Param("id") id: string, @Res({ passthrough: true }) res: Response) {
    const { body, filename } = await this.service.readPdf(id);

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${filename}"`,
      "Cache-Control": "no-store",
      "Content-Length": String(body.byteLength),
    });

    return new StreamableFile(body);
  }

  @Delete(":id/pdf")
  @AdminOnly()
  @ApiBearerAuth()
  async deletePdf(@Param("id") id: string) {
    return this.service.removePdf(id);
  }
}
