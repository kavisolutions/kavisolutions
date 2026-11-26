import { Inject, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { and, desc, eq, ilike, or, type SQL } from "drizzle-orm";

import { uuid } from "@/_shared/team-helpers";
import { sanitizeText } from "@/_shared/text";
import { DATABASE } from "@/db/drizzle/drizzle.module";
import type { Database } from "@/db/drizzle/drizzle.client";
import {
  LEAD_SERVICES,
  LEAD_STATUSES,
  leads,
  type LeadRow,
  type LeadService,
  type LeadStatus,
} from "@/db/drizzle/schema";

export type LeadInput = {
  service: LeadService;
  kind?: string;
  name?: string;
  email?: string;
  phone?: string;
  organisation?: string;
  subject?: string;
  message?: string;
  reference?: string;
  source?: string;
};

export type LeadDto = {
  id: string;
  service: LeadService;
  kind: string;
  name: string;
  email: string;
  phone: string;
  organisation: string;
  subject: string;
  message: string;
  reference: string;
  source: string;
  status: LeadStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

export type LeadCounts = {
  total: number;
  byService: Record<string, number>;
  byStatus: Record<string, number>;
};

const isService = (value: string): value is LeadService =>
  (LEAD_SERVICES as readonly string[]).includes(value);

const isStatus = (value: string): value is LeadStatus =>
  (LEAD_STATUSES as readonly string[]).includes(value);

const toDto = (row: LeadRow): LeadDto => ({
  id: row.id,
  service: isService(row.service) ? row.service : "contact",
  kind: row.kind,
  name: row.name,
  email: row.email,
  phone: row.phone,
  organisation: row.organisation,
  subject: row.subject,
  message: row.message,
  reference: row.reference,
  source: row.source,
  status: isStatus(row.status) ? row.status : "new",
  notes: row.notes,
  createdAt: row.createdAt.toISOString(),
  updatedAt: row.updatedAt.toISOString(),
});

/* Spreadsheet cells must not be interpreted as formulas. */
const csvCell = (value: string): string => {
  const text = value.replace(/\r?\n/g, " ");
  const safe = /^[=@]/.test(text) || /^[+-](?![0-9])/.test(text) ? `'${text}` : text;
  return `"${safe.replace(/"/g, '""')}"`;
};

@Injectable()
export class LeadsService {
  private readonly logger = new Logger(LeadsService.name);

  constructor(@Inject(DATABASE) private readonly db: Database) {}

  /* Public forms must never fail because the lead inbox is unavailable: mail
     delivery and the service-specific registry remain the primary response. */
  async captureBestEffort(input: LeadInput, context: string): Promise<void> {
    try {
      await this.capture(input);
    } catch (error) {
      // Never log submitted personal data, only the transport failure.
      this.logger.error(
        `${context} lead capture failed: ${
          error instanceof Error ? error.message : "unknown error"
        }`,
      );
    }
  }

  /* Called from public form controllers. Returns void on purpose: a lead is a
     side effect of the form submission, not something the visitor can read. */
  async capture(input: LeadInput): Promise<void> {
    await this.db.insert(leads).values({
      id: uuid(),
      service: input.service,
      kind: sanitizeText(input.kind, 60),
      name: sanitizeText(input.name, 160),
      email: sanitizeText(input.email, 254).toLowerCase(),
      phone: sanitizeText(input.phone, 40),
      organisation: sanitizeText(input.organisation, 200),
      subject: sanitizeText(input.subject, 200),
      message: sanitizeText(input.message, 4000),
      reference: sanitizeText(input.reference, 160),
      source: sanitizeText(input.source, 120),
      status: "new",
    });
  }

  private filters(options: { service?: string; status?: string; search?: string }): SQL[] {
    const filters: SQL[] = [];

    if (options.service && isService(options.service)) {
      filters.push(eq(leads.service, options.service));
    }
    if (options.status && isStatus(options.status)) {
      filters.push(eq(leads.status, options.status));
    }

    const search = sanitizeText(options.search, 120);
    if (search) {
      const pattern = `%${search}%`;
      const match = or(
        ilike(leads.name, pattern),
        ilike(leads.email, pattern),
        ilike(leads.phone, pattern),
        ilike(leads.organisation, pattern),
        ilike(leads.subject, pattern),
        ilike(leads.reference, pattern),
        ilike(leads.message, pattern),
      );
      if (match) filters.push(match);
    }

    return filters;
  }

  async list(options: { service?: string; status?: string; search?: string } = {}): Promise<{
    leads: LeadDto[];
    counts: LeadCounts;
  }> {
    const all = await this.db
      .select({ service: leads.service, status: leads.status })
      .from(leads);

    const counts: LeadCounts = {
      total: all.length,
      byService: {},
      byStatus: {},
    };
    for (const row of all) {
      counts.byService[row.service] = (counts.byService[row.service] ?? 0) + 1;
      counts.byStatus[row.status] = (counts.byStatus[row.status] ?? 0) + 1;
    }

    const filters = this.filters(options);
    const rows = await this.db
      .select()
      .from(leads)
      .where(filters.length ? and(...filters) : undefined)
      .orderBy(desc(leads.createdAt));

    return { leads: rows.map(toDto), counts };
  }

  async update(
    id: string,
    payload: { status?: LeadStatus; notes?: string },
  ): Promise<LeadDto> {
    const set: Partial<LeadRow> = { updatedAt: new Date() };
    if (payload.status !== undefined) set.status = payload.status;
    if (payload.notes !== undefined) set.notes = sanitizeText(payload.notes, 4000);

    const [row] = await this.db
      .update(leads)
      .set(set)
      .where(eq(leads.id, id))
      .returning();

    if (!row) throw new NotFoundException("Lead not found");
    return toDto(row);
  }

  async remove(id: string): Promise<{ ok: true }> {
    const [row] = await this.db
      .delete(leads)
      .where(eq(leads.id, id))
      .returning({ id: leads.id });

    if (!row) throw new NotFoundException("Lead not found");
    return { ok: true };
  }

  async exportCsv(options: { service?: string; status?: string; search?: string } = {}): Promise<string> {
    const filters = this.filters(options);
    const rows = await this.db
      .select()
      .from(leads)
      .where(filters.length ? and(...filters) : undefined)
      .orderBy(desc(leads.createdAt));

    const header = [
      "Created",
      "Service",
      "Type",
      "Name",
      "Email",
      "Phone",
      "Organisation",
      "Subject",
      "Status",
      "Reference",
      "Source",
      "Message",
      "Internal notes",
    ];

    const lines = rows.map((row) =>
      [
        row.createdAt.toISOString(),
        row.service,
        row.kind,
        row.name,
        row.email,
        row.phone,
        row.organisation,
        row.subject,
        row.status,
        row.reference,
        row.source,
        row.message,
        row.notes,
      ]
        .map((value) => csvCell(String(value)))
        .join(","),
    );

    return [header.map(csvCell).join(","), ...lines].join("\n");
  }
}
