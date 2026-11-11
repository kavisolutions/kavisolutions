import { NotFoundException } from "@nestjs/common";

import { CertificatesService } from "@/modules/certificates/certificates.service";
import type { StorageService } from "@/modules/upload/storage.service";
import type { Database } from "@/db/drizzle/drizzle.client";

/* Storage is stubbed per test; the certificate logic is what is under test. */
const buildStorage = () => {
  const calls = { put: [] as unknown[], deleted: [] as string[] };
  const storage = {
    certificateKey: (id: string) => {
      const year = id.match(/-(\d{4})-/)?.[1] ?? "unknown";
      return `certificates/${year}/${id}.pdf`;
    },
    putPrivate: async (key: string, body: Buffer, contentType: string, metadata?: unknown) => {
      calls.put.push({ key, size: body.byteLength, contentType, metadata });
    },
    getPrivate: async () => Buffer.from("%PDF-1.4 test"),
    deletePrivate: async (key: string) => {
      calls.deleted.push(key);
    },
  };
  return { storage: storage as unknown as StorageService, calls };
};

/* Convenience: most tests do not touch storage. */
const serviceWith = (db: Database, storage?: StorageService) =>
  new CertificatesService(db, storage ?? buildStorage().storage);

const baseRow = {
  id: "KV-FEL-2026-0001",
  type: "fellowship",
  recipientName: "Aarav Krishna Reddy",
  programme: "Kavi Fellows · Cohort 04",
  role: null,
  startDate: "2026-01-12",
  endDate: "2026-04-03",
  issuedOn: "2026-04-10",
  summary: null,
  status: "issued",
  revokedOn: null,
  revokedReason: null,
  pdfKey: null as string | null,
  pdfSize: null as number | null,
  pdfUploadedAt: null as Date | null,
  createdAt: new Date("2026-04-10T00:00:00.000Z"),
  updatedAt: new Date("2026-04-10T00:00:00.000Z"),
};

/* Minimal chainable stub: every builder method returns itself, `returning`
   resolves the rows and `where` records its argument. */
const buildDb = (rows: unknown[]) => {
  const calls = { inserted: [] as unknown[], updated: [] as unknown[] };

  const builder = {
    insert: () => ({
      values: (values: unknown) => {
        calls.inserted.push(values);
        return {
          onConflictDoUpdate: () => ({ returning: async () => rows }),
        };
      },
    }),
    update: () => ({
      set: (values: unknown) => {
        calls.updated.push(values);
        return {
          where: () => ({ returning: async () => rows }),
        };
      },
    }),
    select: () => ({
      from: () => ({
        where: () => ({ limit: async () => rows }),
        orderBy: async () => rows,
      }),
    }),
  };

  return { db: builder as unknown as Database, calls };
};

describe("CertificatesService.reinstate", () => {
  it("clears the revocation fields and marks the certificate issued", async () => {
    const { db, calls } = buildDb([{ ...baseRow }]);
    const service = serviceWith(db);

    await service.reinstate({ id: "kv-fel-2026-0001" });

    expect(calls.updated[0]).toMatchObject({
      status: "issued",
      revokedOn: null,
      revokedReason: null,
    });
  });

  it("404s for an unknown certificate", async () => {
    const { db } = buildDb([]);
    const service = serviceWith(db);

    await expect(service.reinstate({ id: "KV-FEL-2026-4242" })).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});

describe("CertificatesService.revoke", () => {
  it("records the revocation date and reason", async () => {
    const { db, calls } = buildDb([{ ...baseRow, status: "revoked" }]);
    const service = serviceWith(db);

    await service.revoke({ id: "KV-FEL-2026-0001", reason: "Issued in error" });

    expect(calls.updated[0]).toMatchObject({
      status: "revoked",
      revokedReason: "Issued in error",
    });
  });
});

describe("CertificatesService.create", () => {
  /* An upsert must not resurrect a revoked certificate — reinstating is a
     separate, explicit action. */
  it("does not touch status or revocation fields when re-recording", async () => {
    const { db, calls } = buildDb([{ ...baseRow }]);
    const service = serviceWith(db);

    await service.create({
      id: "kv-fel-2026-0001",
      type: "fellowship",
      recipientName: "Aarav Krishna Reddy",
      issuedOn: "2026-04-10",
    });

    expect(calls.inserted[0]).toMatchObject({ status: "issued", id: "KV-FEL-2026-0001" });
  });

  it("returns the real recipient name to admins even when revoked", async () => {
    const { db } = buildDb([{ ...baseRow, status: "revoked" }]);
    const service = serviceWith(db);

    const result = await service.revoke({ id: "KV-FEL-2026-0001" });

    expect(result.recipient).toBe("Aarav Krishna Reddy");
    expect(result.status).toBe("revoked");
  });
});

describe("CertificatesService.verify", () => {
  it("withholds the name for a revoked certificate", async () => {
    const { db } = buildDb([{ ...baseRow, status: "revoked" }]);
    const service = serviceWith(db);

    const result = await service.verify("kv-fel-2026-0001");

    expect(result?.recipient).toBe("Withheld");
    expect(result?.status).toBe("revoked");
  });
});

describe("CertificatesService.remove / restore", () => {
  it("soft deletes by setting deletedAt", async () => {
    const { db, calls } = buildDb([{ ...baseRow }]);
    const service = serviceWith(db);

    await expect(service.remove({ id: "kv-fel-2026-0001" })).resolves.toEqual({
      ok: true,
      id: "KV-FEL-2026-0001",
    });
    expect(calls.updated[0]).toMatchObject({ deletedAt: expect.any(Date) });
  });

  it("404s when deleting an unknown certificate", async () => {
    const { db } = buildDb([]);
    const service = serviceWith(db);

    await expect(service.remove({ id: "KV-FEL-2026-4242" })).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it("restores by clearing deletedAt", async () => {
    const { db, calls } = buildDb([{ ...baseRow }]);
    const service = serviceWith(db);

    const result = await service.restore({ id: "KV-FEL-2026-0001" });

    expect(calls.updated[0]).toMatchObject({ deletedAt: null });
    expect(result.deletedAt).toBeNull();
  });

  /* Re-recording a deleted ID is an explicit decision to bring it back. */
  it("clears the tombstone when a deleted certificate is re-recorded", async () => {
    const { db, calls } = buildDb([{ ...baseRow, deletedAt: new Date() }]);
    const service = serviceWith(db);

    await service.create({
      id: "KV-FEL-2026-0001",
      type: "fellowship",
      recipientName: "Aarav Krishna Reddy",
      issuedOn: "2026-04-10",
    });

    expect(calls.inserted[0]).toMatchObject({ id: "KV-FEL-2026-0001" });
  });
});

describe("CertificatesService PDF storage", () => {
  it("uploads to the private bucket and records the key", async () => {
    const { db, calls } = buildDb([{ ...baseRow, pdfKey: null }]);
    const { storage, calls: storageCalls } = buildStorage();
    const service = serviceWith(db, storage);

    await service.attachPdf("kv-fel-2026-0001", {
      buffer: Buffer.from("%PDF-1.4 fake"),
      originalname: "cert.pdf",
    });

    expect(storageCalls.put[0]).toMatchObject({
      key: "certificates/2026/KV-FEL-2026-0001.pdf",
      contentType: "application/pdf",
    });
    expect(calls.updated[0]).toMatchObject({
      pdfKey: "certificates/2026/KV-FEL-2026-0001.pdf",
    });
  });

  it("404s when attaching a PDF to an unknown certificate", async () => {
    const { db } = buildDb([]);
    const service = serviceWith(db);

    await expect(
      service.attachPdf("KV-FEL-2026-4242", {
        buffer: Buffer.from("%PDF-1.4"),
        originalname: "x.pdf",
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("404s when the record has no PDF", async () => {
    const { db } = buildDb([{ ...baseRow, pdfKey: null }]);
    const service = serviceWith(db);

    await expect(service.readPdf("kv-fel-2026-0001")).rejects.toBeInstanceOf(NotFoundException);
  });

  it("returns bytes and a filename for an existing PDF", async () => {
    const { db } = buildDb([{ ...baseRow, pdfKey: "certificates/2026/KV-FEL-2026-0001.pdf" }]);
    const service = serviceWith(db);

    const result = await service.readPdf("kv-fel-2026-0001");

    expect(result.filename).toBe("KV-FEL-2026-0001.pdf");
    expect(result.body.byteLength).toBeGreaterThan(0);
  });

  it("deletes the object and clears the columns", async () => {
    const { db, calls } = buildDb([
      { ...baseRow, pdfKey: "certificates/2026/KV-FEL-2026-0001.pdf" },
    ]);
    const { storage, calls: storageCalls } = buildStorage();
    const service = serviceWith(db, storage);

    await service.removePdf("KV-FEL-2026-0001");

    expect(storageCalls.deleted).toEqual(["certificates/2026/KV-FEL-2026-0001.pdf"]);
    expect(calls.updated[0]).toMatchObject({
      pdfKey: null,
      pdfSize: null,
      pdfUploadedAt: null,
    });
  });

  it("shards the object key by issue year", async () => {
    const { db } = buildDb([]);
    const service = serviceWith(db);

    expect(service["storage"].certificateKey("KV-EXP-2025-0002")).toBe(
      "certificates/2025/KV-EXP-2025-0002.pdf",
    );
  });
});
