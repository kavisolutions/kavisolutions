import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { randomBytes } from "node:crypto";
import { desc, eq } from "drizzle-orm";

import { sanitizeText } from "@/_shared/text";
import { uuid } from "@/_shared/team-helpers";
import { DATABASE } from "@/db/drizzle/drizzle.module";
import type { Database } from "@/db/drizzle/drizzle.client";
import {
  fellowshipApplications,
  fellowshipDocuments,
  type FellowshipDocumentRow,
} from "@/db/drizzle/schema";
import type { UpdateFellowshipDocumentDto } from "@/modules/fellowship-onboarding/dto/fellowship-onboarding.dto";
import { StorageService } from "@/modules/upload/storage.service";

const ALLOWED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
];
const MAX_SIZE = 10 * 1024 * 1024;

export type FellowshipDocumentDto = {
  id: string;
  applicationId: string;
  type: string;
  name: string;
  mimeType: string;
  size: number;
  status: string;
  notes: string;
  uploadedBy: string;
  verifiedAt: string | null;
  createdAt: string;
};

const toDto = (row: FellowshipDocumentRow): FellowshipDocumentDto => ({
  id: row.id,
  applicationId: row.applicationId,
  type: row.type,
  name: row.name,
  mimeType: row.mimeType,
  size: row.size,
  status: row.status,
  notes: row.notes,
  uploadedBy: row.uploadedBy,
  verifiedAt: row.verifiedAt ? row.verifiedAt.toISOString() : null,
  createdAt: row.createdAt.toISOString(),
});

@Injectable()
export class FellowshipDocumentsService {
  constructor(
    @Inject(DATABASE) private readonly db: Database,
    private readonly storage: StorageService,
  ) {}

  private async assertApplication(applicationId: string): Promise<void> {
    const [row] = await this.db
      .select({ id: fellowshipApplications.id })
      .from(fellowshipApplications)
      .where(eq(fellowshipApplications.id, applicationId))
      .limit(1);
    if (!row) throw new NotFoundException("Application not found");
  }

  async list(applicationId: string) {
    await this.assertApplication(applicationId);
    const rows = await this.db
      .select()
      .from(fellowshipDocuments)
      .where(eq(fellowshipDocuments.applicationId, applicationId))
      .orderBy(desc(fellowshipDocuments.createdAt));
    return { documents: rows.map(toDto) };
  }

  async upload(
    applicationId: string,
    file: Express.Multer.File | undefined,
    type: string,
    name: string,
    uploadedBy: string,
  ) {
    await this.assertApplication(applicationId);
    if (!file) throw new BadRequestException("No file provided");
    if (!ALLOWED_TYPES.includes(file.mimetype)) {
      throw new BadRequestException("Allowed documents: PDF, JPG, PNG or WebP");
    }
    if (file.size > MAX_SIZE) {
      throw new BadRequestException("Document too large. Maximum size is 10MB");
    }

    const ext = (file.originalname.split(".").pop() || "pdf").toLowerCase();
    const key = `fellowship-documents/${applicationId}/${randomBytes(16).toString("hex")}.${ext}`;
    await this.storage.putPrivate(key, file.buffer, file.mimetype);

    const [row] = await this.db
      .insert(fellowshipDocuments)
      .values({
        id: uuid(),
        applicationId,
        type: sanitizeText(type, 80) || "other",
        name: sanitizeText(name, 200) || file.originalname,
        storageKey: key,
        mimeType: file.mimetype,
        size: file.size,
        uploadedBy: sanitizeText(uploadedBy, 200),
      })
      .returning();

    return { document: toDto(row) };
  }

  async update(id: string, payload: UpdateFellowshipDocumentDto) {
    const set: Partial<FellowshipDocumentRow> = {};
    if (payload.status !== undefined) {
      set.status = payload.status;
      set.verifiedAt =
        payload.status === "verified" ? new Date() : null;
    }
    if (payload.notes !== undefined) set.notes = sanitizeText(payload.notes, 2000);

    const [row] = await this.db
      .update(fellowshipDocuments)
      .set(set)
      .where(eq(fellowshipDocuments.id, id))
      .returning();
    if (!row) throw new NotFoundException("Document not found");
    return { document: toDto(row) };
  }

  async download(id: string) {
    const [row] = await this.db
      .select()
      .from(fellowshipDocuments)
      .where(eq(fellowshipDocuments.id, id))
      .limit(1);
    if (!row) throw new NotFoundException("Document not found");
    const body = await this.storage.getPrivate(row.storageKey);
    if (!body) throw new NotFoundException("Document file not found");
    return { row, body };
  }

  async remove(id: string) {
    const [row] = await this.db
      .delete(fellowshipDocuments)
      .where(eq(fellowshipDocuments.id, id))
      .returning();
    if (!row) throw new NotFoundException("Document not found");
    try {
      await this.storage.deletePrivate(row.storageKey);
    } catch {
      // The database row is gone; orphaned storage can be cleaned up later.
    }
    return { ok: true };
  }
}
