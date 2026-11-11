import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { and, desc, eq, isNull } from "drizzle-orm";

import {
  CERTIFICATE_TYPE_LABELS,
  isCertificateType,
  isVerifiable,
  normalizeCertificateId,
  publicRecipientName,
  type CertificateType,
} from "@/_shared/certificates";
import { sanitizeText } from "@/_shared/text";
import { DATABASE } from "@/db/drizzle/drizzle.module";
import type { Database } from "@/db/drizzle/drizzle.client";
import { certificates, type CertificateRow } from "@/db/drizzle/schema";
import { StorageService } from "@/modules/upload/storage.service";
import type {
  CertificateIdDto,
  CreateCertificateDto,
  ReinstateCertificateDto,
  RevokeCertificateDto,
} from "@/modules/certificates/dto/certificate.dto";
export type PublicCertificateDto = {
  id: string;
  type: CertificateType;
  title: string;
  recipient: string;
  programme: string | null;
  role: string | null;
  startDate: string | null;
  endDate: string | null;
  issuedOn: string;
  summary: string | null;
  status: "issued" | "revoked";
};

/* Admin view: same shape plus the audit fields the public lookup must not
   expose (why and when a certificate was revoked). */
export type AdminCertificateDto = PublicCertificateDto & {
  revokedOn: string | null;
  revokedReason: string | null;
  deletedAt: string | null;
  /** True when a PDF exists in the private bucket. */
  hasPdf: boolean;
  pdfSize: number | null;
  pdfUploadedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

const toPublic = (row: CertificateRow): PublicCertificateDto => {
  const type: CertificateType = isCertificateType(row.type) ? row.type : "fellowship";

  return {
    id: row.id,
    type,
    title: CERTIFICATE_TYPE_LABELS[type],
    recipient: publicRecipientName(row.recipientName, row.status),
    programme: row.programme ?? null,
    role: row.role ?? null,
    startDate: row.startDate ?? null,
    endDate: row.endDate ?? null,
    issuedOn: row.issuedOn,
    summary: row.summary ?? null,
    status: isVerifiable(row.status) ? "issued" : "revoked",
  };
};

/* Admin rows keep the real recipient name — the withholding rule only exists
   to protect the public lookup. */
const toAdmin = (row: CertificateRow): AdminCertificateDto => {
  const type: CertificateType = isCertificateType(row.type) ? row.type : "fellowship";

  return {
    id: row.id,
    type,
    title: CERTIFICATE_TYPE_LABELS[type],
    recipient: row.recipientName,
    programme: row.programme ?? null,
    role: row.role ?? null,
    startDate: row.startDate ?? null,
    endDate: row.endDate ?? null,
    issuedOn: row.issuedOn,
    summary: row.summary ?? null,
    status: isVerifiable(row.status) ? "issued" : "revoked",
    revokedOn: row.revokedOn ?? null,
    revokedReason: row.revokedReason ?? null,
    deletedAt: row.deletedAt ? row.deletedAt.toISOString() : null,
    hasPdf: Boolean(row.pdfKey),
    pdfSize: row.pdfSize ?? null,
    pdfUploadedAt: row.pdfUploadedAt ? row.pdfUploadedAt.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
};

@Injectable()
export class CertificatesService {
  constructor(
    @Inject(DATABASE) private readonly db: Database,
    private readonly storage: StorageService,
  ) {}

  /* Public lookup. A soft-deleted certificate is indistinguishable from an
     unknown one — the printed document must stop verifying entirely. */
  async verify(rawId: string): Promise<PublicCertificateDto | null> {
    const id = normalizeCertificateId(rawId);

    const [row] = await this.db
      .select()
      .from(certificates)
      .where(and(eq(certificates.id, id), isNull(certificates.deletedAt)))
      .limit(1);

    return row ? toPublic(row) : null;
  }

  /* Admin list. By default deleted records are hidden; `includeDeleted` backs
     the "Deleted" filter in the console so a mistake can be undone. */
  async list(options: { includeDeleted?: boolean } = {}) {
    const rows = await this.db
      .select()
      .from(certificates)
      .where(options.includeDeleted ? undefined : isNull(certificates.deletedAt))
      .orderBy(desc(certificates.issuedOn), desc(certificates.id));

    return { certificates: rows.map(toAdmin) };
  }

  async create(payload: CreateCertificateDto): Promise<AdminCertificateDto> {
    const id = normalizeCertificateId(payload.id);

    const [row] = await this.db
      .insert(certificates)
      .values({
        id,
        type: payload.type,
        recipientName: sanitizeText(payload.recipientName, 160),
        programme: sanitizeText(payload.programme, 200) || null,
        role: sanitizeText(payload.role, 120) || null,
        startDate: payload.startDate ?? null,
        endDate: payload.endDate ?? null,
        issuedOn: payload.issuedOn,
        summary: sanitizeText(payload.summary, 600) || null,
        status: "issued",
      })
      .onConflictDoUpdate({
        target: certificates.id,
        set: {
          type: payload.type,
          recipientName: sanitizeText(payload.recipientName, 160),
          programme: sanitizeText(payload.programme, 200) || null,
          role: sanitizeText(payload.role, 120) || null,
          startDate: payload.startDate ?? null,
          endDate: payload.endDate ?? null,
          issuedOn: payload.issuedOn,
          summary: sanitizeText(payload.summary, 600) || null,
          /* Re-recording an ID that was soft-deleted is an explicit decision to
             bring it back, so clear the tombstone. Revocation is untouched. */
          deletedAt: null,
          updatedAt: new Date(),
        },
      })
      .returning();

    return toAdmin(row);
  }

  /* Reinstating is deliberately separate from create(): an upsert must never
     quietly bring a revoked certificate back to life. */
  async reinstate(payload: ReinstateCertificateDto): Promise<AdminCertificateDto> {
    const id = normalizeCertificateId(payload.id);

    const [row] = await this.db
      .update(certificates)
      .set({
        status: "issued",
        revokedOn: null,
        revokedReason: null,
        updatedAt: new Date(),
      })
      .where(eq(certificates.id, id))
      .returning();

    if (!row) throw new NotFoundException("Certificate not found");
    return toAdmin(row);
  }

  async revoke(payload: RevokeCertificateDto): Promise<AdminCertificateDto> {
    const id = normalizeCertificateId(payload.id);

    const [row] = await this.db
      .update(certificates)
      .set({
        status: "revoked",
        revokedOn: new Date().toISOString().slice(0, 10),
        revokedReason: sanitizeText(payload.reason, 300) || null,
        updatedAt: new Date(),
      })
      .where(and(eq(certificates.id, id), isNull(certificates.deletedAt)))
      .returning();

    if (!row) throw new NotFoundException("Certificate not found");
    return toAdmin(row);
  }

  /* Soft delete. The row stays so the audit trail survives and the action can
     be undone; the public lookup stops responding immediately. */
  async remove(payload: CertificateIdDto): Promise<{ ok: true; id: string }> {
    const id = normalizeCertificateId(payload.id);

    const [row] = await this.db
      .update(certificates)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(and(eq(certificates.id, id), isNull(certificates.deletedAt)))
      .returning();

    if (!row) throw new NotFoundException("Certificate not found");
    return { ok: true, id: row.id };
  }

  async restore(payload: CertificateIdDto): Promise<AdminCertificateDto> {
    const id = normalizeCertificateId(payload.id);

    const [row] = await this.db
      .update(certificates)
      .set({ deletedAt: null, updatedAt: new Date() })
      .where(eq(certificates.id, id))
      .returning();

    if (!row) throw new NotFoundException("Certificate not found");
    return toAdmin(row);
  }

  /* --- PDF storage (private bucket) -------------------------------------- */

  /* Attaches a generated PDF to an existing certificate record. The certificate
     must already exist: the PDF is the artefact, the row is the source of truth
     for verification. */
  async attachPdf(
    rawId: string,
    file: { buffer: Buffer; originalname: string },
  ): Promise<AdminCertificateDto> {
    const id = normalizeCertificateId(rawId);

    const [existing] = await this.db
      .select()
      .from(certificates)
      .where(eq(certificates.id, id))
      .limit(1);

    if (!existing) throw new NotFoundException("Certificate not found");

    const key = this.storage.certificateKey(id);
    await this.storage.putPrivate(key, file.buffer, "application/pdf", {
      certificateId: id,
      originalName: file.originalname,
    });

    const [row] = await this.db
      .update(certificates)
      .set({
        pdfKey: key,
        pdfSize: file.buffer.byteLength,
        pdfUploadedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(certificates.id, id))
      .returning();

    return toAdmin(row);
  }

  /* Returns the bytes for the download endpoint. Deliberately does not check
     revocation: the issued document is what it is, and revocation is reported
     by the verification page, not by withholding the artefact from its owner
     or an auditor. */
  async readPdf(rawId: string): Promise<{ body: Buffer; filename: string }> {
    const id = normalizeCertificateId(rawId);

    const [row] = await this.db
      .select()
      .from(certificates)
      .where(eq(certificates.id, id))
      .limit(1);

    if (!row) throw new NotFoundException("Certificate not found");
    if (!row.pdfKey) throw new NotFoundException("No PDF attached to this certificate");

    const body = await this.storage.getPrivate(row.pdfKey);
    if (!body) throw new NotFoundException("Certificate PDF is missing from storage");

    return { body, filename: `${id}.pdf` };
  }

  async removePdf(rawId: string): Promise<AdminCertificateDto> {
    const id = normalizeCertificateId(rawId);

    const [existing] = await this.db
      .select()
      .from(certificates)
      .where(eq(certificates.id, id))
      .limit(1);

    if (!existing) throw new NotFoundException("Certificate not found");

    if (existing.pdfKey) {
      await this.storage.deletePrivate(existing.pdfKey);
    }

    const [row] = await this.db
      .update(certificates)
      .set({ pdfKey: null, pdfSize: null, pdfUploadedAt: null, updatedAt: new Date() })
      .where(eq(certificates.id, id))
      .returning();

    return toAdmin(row);
  }
}
