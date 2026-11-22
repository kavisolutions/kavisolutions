import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { and, desc, eq, ilike, or, type SQL } from "drizzle-orm";

import { uuid } from "@/_shared/team-helpers";
import { sanitizeText } from "@/_shared/text";
import { DATABASE } from "@/db/drizzle/drizzle.module";
import type { Database } from "@/db/drizzle/drizzle.client";
import {
  surveyContent,
  surveyEnquiries,
  SURVEY_ENQUIRY_STATUSES,
  type SurveyEnquiryRow,
  type SurveyEnquiryStatus,
} from "@/db/drizzle/schema";
import type { CreateSurveyEnquiryDto } from "@/modules/survey/dto/survey-enquiry.dto";
import type { UpdateSurveyEnquiryDto } from "@/modules/survey/dto/update-survey-enquiry.dto";

export type SurveyEnquiryDto = {
  id: string;
  name: string;
  email: string;
  phone: string;
  organisation: string;
  service: string;
  message: string;
  status: SurveyEnquiryStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

const isStatus = (value: string): value is SurveyEnquiryStatus =>
  (SURVEY_ENQUIRY_STATUSES as readonly string[]).includes(value);

const toDto = (row: SurveyEnquiryRow): SurveyEnquiryDto => ({
  id: row.id,
  name: row.name,
  email: row.email,
  phone: row.phone,
  organisation: row.organisation ?? "",
  service: row.service ?? "",
  message: row.message,
  status: isStatus(row.status) ? row.status : "new",
  notes: row.notes ?? "",
  createdAt: row.createdAt.toISOString(),
  updatedAt: row.updatedAt.toISOString(),
});

/* Spreadsheet cells must not be interpreted as formulas. */
const csvCell = (value: string): string => {
  const text = value.replace(/\r?\n/g, " ");
  const safe = /^[=@]/.test(text) || /^[+-](?![0-9])/.test(text) ? `'${text}` : text;
  return `"${safe.replace(/"/g, '""')}"`;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

/* The frontend owns the shape; the API only checks the blocks it renders so a
   malformed PUT cannot replace the page with an unusable document. */
const isSurveyContent = (value: unknown): value is Record<string, unknown> => {
  if (!isRecord(value)) return false;

  const objects = ["brand", "hero"];
  const arrays = [
    "verticals",
    "approach",
    "engagement",
    "sampleProjects",
    "previousWork",
    "sectors",
    "faqs",
  ];

  const validVerticals =
    Array.isArray(value.verticals) &&
    value.verticals.every(
      (vertical) =>
        isRecord(vertical) &&
        typeof vertical.tag === "string" &&
        typeof vertical.title === "string" &&
        typeof vertical.summary === "string" &&
        Array.isArray(vertical.services) &&
        vertical.services.every((service) => typeof service === "string"),
    );

  const validNetwork =
    isRecord(value.network) &&
    typeof value.network.eyebrow === "string" &&
    typeof value.network.title === "string" &&
    typeof value.network.description === "string" &&
    Array.isArray(value.network.requirements) &&
    value.network.requirements.every(
      (requirement) => typeof requirement === "string",
    ) &&
    typeof value.network.objective === "string";

  return (
    objects.every((key) => isRecord(value[key])) &&
    arrays.every((key) => Array.isArray(value[key])) &&
    validVerticals &&
    validNetwork
  );
};

@Injectable()
export class SurveyService {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async getContent(): Promise<unknown | null> {
    const [row] = await this.db
      .select({ data: surveyContent.data })
      .from(surveyContent)
      .where(eq(surveyContent.id, "main"))
      .limit(1);

    return row?.data ?? null;
  }

  async saveContent(value: unknown): Promise<unknown> {
    if (!isSurveyContent(value)) {
      throw new BadRequestException(
        "Content must include brand, hero, verticals, approach, engagement, sampleProjects, previousWork, sectors and faqs.",
      );
    }

    const [row] = await this.db
      .insert(surveyContent)
      .values({ id: "main", data: value, updatedAt: new Date() })
      .onConflictDoUpdate({
        target: surveyContent.id,
        set: { data: value, updatedAt: new Date() },
      })
      .returning({ data: surveyContent.data });

    return row.data;
  }

  /* Client enquiries are stored before the notification email is attempted, so
     an SMTP outage cannot lose a lead. Surveyor registrations keep their own
     registry and do not go through this table. */
  async createClient(payload: CreateSurveyEnquiryDto): Promise<SurveyEnquiryDto> {
    const [row] = await this.db
      .insert(surveyEnquiries)
      .values({
        id: uuid(),
        name: sanitizeText(payload.name, 120),
        email: sanitizeText(payload.email, 200).toLowerCase(),
        phone: sanitizeText(payload.phone, 30),
        organisation: sanitizeText(payload.organisation, 160),
        service: sanitizeText(payload.service, 120),
        message: sanitizeText(payload.message, 2000),
        status: "new",
      })
      .returning();

    return toDto(row);
  }

  async listEnquiries(options: { status?: string; search?: string } = {}) {
    const filters: SQL[] = [];

    if (options.status && isStatus(options.status)) {
      filters.push(eq(surveyEnquiries.status, options.status));
    }

    const search = sanitizeText(options.search, 120);
    if (search) {
      const pattern = `%${search}%`;
      const match = or(
        ilike(surveyEnquiries.name, pattern),
        ilike(surveyEnquiries.email, pattern),
        ilike(surveyEnquiries.organisation, pattern),
        ilike(surveyEnquiries.service, pattern),
      );
      if (match) filters.push(match);
    }

    const rows = await this.db
      .select()
      .from(surveyEnquiries)
      .where(filters.length ? and(...filters) : undefined)
      .orderBy(desc(surveyEnquiries.createdAt));

    return { enquiries: rows.map(toDto) };
  }

  async findOne(id: string): Promise<SurveyEnquiryDto> {
    const [row] = await this.db
      .select()
      .from(surveyEnquiries)
      .where(eq(surveyEnquiries.id, id))
      .limit(1);

    if (!row) throw new NotFoundException("Enquiry not found");
    return toDto(row);
  }

  async updateEnquiry(id: string, payload: UpdateSurveyEnquiryDto): Promise<SurveyEnquiryDto> {
    const set: Partial<SurveyEnquiryRow> = { updatedAt: new Date() };

    if (payload.status !== undefined) set.status = payload.status;
    if (payload.notes !== undefined) set.notes = sanitizeText(payload.notes, 2000);

    const [row] = await this.db
      .update(surveyEnquiries)
      .set(set)
      .where(eq(surveyEnquiries.id, id))
      .returning();

    if (!row) throw new NotFoundException("Enquiry not found");
    return toDto(row);
  }

  async removeEnquiry(id: string): Promise<{ ok: true }> {
    const [row] = await this.db
      .delete(surveyEnquiries)
      .where(eq(surveyEnquiries.id, id))
      .returning({ id: surveyEnquiries.id });

    if (!row) throw new NotFoundException("Enquiry not found");
    return { ok: true };
  }

  async exportCsv(): Promise<string> {
    const rows = await this.db
      .select()
      .from(surveyEnquiries)
      .orderBy(desc(surveyEnquiries.createdAt));

    const header = [
      "Created",
      "Name",
      "Email",
      "Phone",
      "Organisation",
      "Service",
      "Status",
      "Message",
      "Internal notes",
    ];

    const lines = rows.map((row) =>
      [
        row.createdAt.toISOString(),
        row.name,
        row.email,
        row.phone,
        row.organisation ?? "",
        row.service ?? "",
        row.status,
        row.message,
        row.notes ?? "",
      ]
        .map((value) => csvCell(String(value)))
        .join(","),
    );

    return [header.map(csvCell).join(","), ...lines].join("\n");
  }
}
