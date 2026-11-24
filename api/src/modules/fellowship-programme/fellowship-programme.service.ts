import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { desc, eq, ne } from "drizzle-orm";

import { sanitizeText } from "@/_shared/text";
import { uuid } from "@/_shared/team-helpers";
import { sendContactEmail } from "@/_shared/mailer";
import { env } from "@/config/env";
import { DATABASE } from "@/db/drizzle/drizzle.module";
import type { Database } from "@/db/drizzle/drizzle.client";
import {
  FELLOWSHIP_CLIENT_STATUSES,
  FELLOWSHIP_COLLEGE_PRIORITIES,
  FELLOWSHIP_COLLEGE_STAGES,
  FELLOWSHIP_CONTENT_CHANNELS,
  FELLOWSHIP_CONTENT_STATUSES,
  FELLOWSHIP_CONTENT_TYPES,
  FELLOWSHIP_DONATION_STATUSES,
  FELLOWSHIP_FEE_STATUSES,
  FELLOWSHIP_INQUIRY_CATEGORIES,
  FELLOWSHIP_INQUIRY_CHANNELS,
  FELLOWSHIP_INQUIRY_PRIORITIES,
  FELLOWSHIP_INQUIRY_STATUSES,
  FELLOWSHIP_OUTREACH_AUDIENCES,
  FELLOWSHIP_OUTREACH_MODES,
  FELLOWSHIP_OUTREACH_SESSION_STATUSES,
  FELLOWSHIP_PLACEMENT_STATUSES,
  FELLOWSHIP_QUESTION_AUDIENCES,
  FELLOWSHIP_QUESTION_STATUSES,
  FELLOWSHIP_STIPEND_STATUSES,
  GURUKULAM_INTEREST_KINDS,
  GURUKULAM_INTEREST_STATUSES,
  fellowshipApplications,
  fellowshipClientEngagements,
  fellowshipColleges,
  fellowshipContentItems,
  fellowshipDonations,
  fellowshipFeePlans,
  fellowshipInquiries,
  fellowshipOutreachQuestions,
  fellowshipOutreachSessions,
  fellowshipPlacements,
  fellowshipStipends,
  gurukulamInterests,
} from "@/db/drizzle/schema";
import { FellowshipAuditService } from "@/modules/fellowship-audit/fellowship-audit.service";
import { SettingsService } from "@/modules/settings/settings.service";

type FieldKind =
  | "text"
  | "longtext"
  | "email"
  | "phone"
  | "number"
  | "boolean"
  | "date"
  | "enum";

type FieldConfig = {
  kind: FieldKind;
  max?: number;
  values?: readonly string[];
  required?: boolean;
};

type ResourceConfig = {
  label: string;
  table: any;
  fields: Record<string, FieldConfig>;
  applicationLinked?: boolean;
  publicFields?: string[];
  defaultValues?: Record<string, unknown>;
};

type ResourceKey =
  | "colleges"
  | "sessions"
  | "questions"
  | "content"
  | "inquiries"
  | "fees"
  | "stipends"
  | "clients"
  | "placements"
  | "donations"
  | "gurukulam";

const RESOURCES: Record<ResourceKey, ResourceConfig> = {
  colleges: {
    label: "College",
    table: fellowshipColleges,
    fields: {
      name: { kind: "text", max: 240, required: true },
      district: { kind: "text", max: 120 },
      state: { kind: "text", max: 120 },
      type: { kind: "text", max: 80 },
      contactName: { kind: "text", max: 160 },
      contactRole: { kind: "text", max: 160 },
      email: { kind: "email", max: 254 },
      phone: { kind: "phone", max: 40 },
      stage: { kind: "enum", values: FELLOWSHIP_COLLEGE_STAGES },
      priority: { kind: "enum", values: FELLOWSHIP_COLLEGE_PRIORITIES },
      lastContactedAt: { kind: "date" },
      nextFollowUpAt: { kind: "date" },
      notes: { kind: "longtext", max: 8000 },
    },
  },
  sessions: {
    label: "Outreach session",
    table: fellowshipOutreachSessions,
    fields: {
      collegeId: { kind: "text", max: 80 },
      title: { kind: "text", max: 240, required: true },
      mode: { kind: "enum", values: FELLOWSHIP_OUTREACH_MODES },
      audience: { kind: "enum", values: FELLOWSHIP_OUTREACH_AUDIENCES },
      scheduledAt: { kind: "date", required: true },
      status: { kind: "enum", values: FELLOWSHIP_OUTREACH_SESSION_STATUSES },
      attendees: { kind: "number" },
      owner: { kind: "text", max: 160 },
      notes: { kind: "longtext", max: 8000 },
    },
  },
  questions: {
    label: "Outreach question",
    table: fellowshipOutreachQuestions,
    fields: {
      collegeId: { kind: "text", max: 80 },
      audience: { kind: "enum", values: FELLOWSHIP_QUESTION_AUDIENCES },
      question: { kind: "longtext", max: 4000, required: true },
      answer: { kind: "longtext", max: 8000 },
      status: { kind: "enum", values: FELLOWSHIP_QUESTION_STATUSES },
      askedAt: { kind: "date" },
      publishedAt: { kind: "date" },
      notes: { kind: "longtext", max: 4000 },
    },
  },
  content: {
    label: "Content item",
    table: fellowshipContentItems,
    fields: {
      title: { kind: "text", max: 240, required: true },
      type: { kind: "enum", values: FELLOWSHIP_CONTENT_TYPES },
      channel: { kind: "enum", values: FELLOWSHIP_CONTENT_CHANNELS },
      status: { kind: "enum", values: FELLOWSHIP_CONTENT_STATUSES },
      owner: { kind: "text", max: 160 },
      dueAt: { kind: "date" },
      publishedAt: { kind: "date" },
      url: { kind: "text", max: 500 },
      impressions: { kind: "number" },
      engagements: { kind: "number" },
      comments: { kind: "number" },
      leads: { kind: "number" },
      notes: { kind: "longtext", max: 8000 },
    },
  },
  inquiries: {
    label: "Enquiry",
    table: fellowshipInquiries,
    fields: {
      name: { kind: "text", max: 160, required: true },
      email: { kind: "email", max: 254 },
      phone: { kind: "phone", max: 40 },
      channel: { kind: "enum", values: FELLOWSHIP_INQUIRY_CHANNELS },
      category: { kind: "enum", values: FELLOWSHIP_INQUIRY_CATEGORIES },
      subject: { kind: "text", max: 240 },
      message: { kind: "longtext", max: 8000, required: true },
      status: { kind: "enum", values: FELLOWSHIP_INQUIRY_STATUSES },
      priority: { kind: "enum", values: FELLOWSHIP_INQUIRY_PRIORITIES },
      owner: { kind: "text", max: 160 },
      callbackAt: { kind: "date" },
      resolution: { kind: "longtext", max: 8000 },
    },
    publicFields: ["name", "email", "phone", "category", "subject", "message"],
    defaultValues: { channel: "website", status: "new", priority: "medium" },
  },
  fees: {
    label: "Fee plan",
    table: fellowshipFeePlans,
    applicationLinked: true,
    fields: {
      applicationId: { kind: "text", max: 80 },
      candidateName: { kind: "text", max: 160 },
      candidateEmail: { kind: "email", max: 254 },
      programme: { kind: "text", max: 80 },
      totalAmount: { kind: "number" },
      scholarshipAmount: { kind: "number" },
      paidAmount: { kind: "number" },
      status: { kind: "enum", values: FELLOWSHIP_FEE_STATUSES },
      dueAt: { kind: "date" },
      notes: { kind: "longtext", max: 8000 },
    },
  },
  stipends: {
    label: "Stipend",
    table: fellowshipStipends,
    applicationLinked: true,
    fields: {
      applicationId: { kind: "text", max: 80 },
      candidateName: { kind: "text", max: 160 },
      candidateEmail: { kind: "email", max: 254 },
      monthNumber: { kind: "number" },
      amount: { kind: "number" },
      status: { kind: "enum", values: FELLOWSHIP_STIPEND_STATUSES },
      dueAt: { kind: "date" },
      paidAt: { kind: "date" },
      mode: { kind: "text", max: 80 },
      reference: { kind: "text", max: 160 },
      notes: { kind: "longtext", max: 8000 },
    },
  },
  clients: {
    label: "Client engagement",
    table: fellowshipClientEngagements,
    fields: {
      clientName: { kind: "text", max: 240, required: true },
      projectTitle: { kind: "text", max: 240 },
      description: { kind: "longtext", max: 8000 },
      contractValue: { kind: "number" },
      receivedAmount: { kind: "number" },
      status: { kind: "enum", values: FELLOWSHIP_CLIENT_STATUSES },
      startAt: { kind: "date" },
      endAt: { kind: "date" },
      owner: { kind: "text", max: 160 },
      notes: { kind: "longtext", max: 8000 },
    },
  },
  placements: {
    label: "Placement",
    table: fellowshipPlacements,
    applicationLinked: true,
    fields: {
      applicationId: { kind: "text", max: 80 },
      candidateName: { kind: "text", max: 160 },
      candidateEmail: { kind: "email", max: 254 },
      employer: { kind: "text", max: 240, required: true },
      role: { kind: "text", max: 200 },
      packageAmount: { kind: "number" },
      status: { kind: "enum", values: FELLOWSHIP_PLACEMENT_STATUSES },
      source: { kind: "text", max: 80 },
      offerAt: { kind: "date" },
      joinedAt: { kind: "date" },
      notes: { kind: "longtext", max: 8000 },
    },
  },
  donations: {
    label: "Donation",
    table: fellowshipDonations,
    fields: {
      donorName: { kind: "text", max: 160, required: true },
      email: { kind: "email", max: 254 },
      phone: { kind: "phone", max: 40 },
      amount: { kind: "number" },
      purpose: { kind: "text", max: 120 },
      status: { kind: "enum", values: FELLOWSHIP_DONATION_STATUSES },
      rewardPreference: { kind: "text", max: 120 },
      anonymous: { kind: "boolean" },
      receivedAt: { kind: "date" },
      mode: { kind: "text", max: 80 },
      reference: { kind: "text", max: 160 },
      notes: { kind: "longtext", max: 8000 },
    },
    publicFields: [
      "donorName",
      "email",
      "phone",
      "amount",
      "purpose",
      "rewardPreference",
      "anonymous",
      "notes",
    ],
    defaultValues: { status: "pledged" },
  },
  gurukulam: {
    label: "Gurukulam interest",
    table: gurukulamInterests,
    applicationLinked: true,
    fields: {
      name: { kind: "text", max: 160, required: true },
      email: { kind: "email", max: 254 },
      phone: { kind: "phone", max: 40 },
      city: { kind: "text", max: 120 },
      kind: { kind: "enum", values: GURUKULAM_INTEREST_KINDS },
      background: { kind: "longtext", max: 4000 },
      goal: { kind: "longtext", max: 4000 },
      status: { kind: "enum", values: GURUKULAM_INTEREST_STATUSES },
      applicationId: { kind: "text", max: 80 },
      notes: { kind: "longtext", max: 8000 },
    },
    publicFields: ["name", "email", "phone", "city", "kind", "background", "goal"],
    defaultValues: { status: "new" },
  },
};

const asString = (value: unknown, max: number): string =>
  sanitizeText(value, max);

const asDate = (value: unknown): Date | null => {
  if (value === null || value === undefined || value === "") return null;
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date;
};

const asNumber = (value: unknown): number => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 0;
  return Math.max(0, Math.round(parsed));
};

const asBoolean = (value: unknown): boolean =>
  value === true || value === "true" || value === 1 || value === "1";

const normalizeValue = (
  key: string,
  field: FieldConfig,
  raw: unknown,
): unknown => {
  if (key.endsWith("Id") && (raw === "" || raw === undefined || raw === null)) {
    return null;
  }
  if (field.kind === "date") return asDate(raw);
  if (field.kind === "number") return asNumber(raw);
  if (field.kind === "boolean") return asBoolean(raw);
  if (field.kind === "enum") {
    const value = asString(raw, 80);
    if (value && !field.values?.includes(value)) {
      throw new BadRequestException(`Invalid value for ${key}`);
    }
    return value;
  }
  if (field.kind === "email") return asString(raw, field.max ?? 254).toLowerCase();
  if (field.kind === "phone") return asString(raw, field.max ?? 40);
  return asString(raw, field.max ?? (field.kind === "longtext" ? 8000 : 500));
};

const moneyStatus = (paid: number, payable: number, current: string): string => {
  if (current === "waived" || current === "cancelled") return current;
  if (payable <= 0) return "waived";
  if (paid >= payable) return "paid";
  if (paid > 0) return "partial";
  return "pending";
};

const serialize = (value: unknown): unknown => {
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map(serialize);
  if (value && typeof value === "object") {
    const output: Record<string, unknown> = {};
    for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
      output[key] = serialize(entry);
    }
    return output;
  }
  return value;
};

@Injectable()
export class FellowshipProgrammeService {
  private readonly logger = new Logger(FellowshipProgrammeService.name);

  constructor(
    @Inject(DATABASE) private readonly db: Database,
    private readonly settings: SettingsService,
    private readonly audit: FellowshipAuditService,
  ) {}

  private config(resource: string): { key: ResourceKey; config: ResourceConfig } {
    if (!Object.hasOwn(RESOURCES, resource)) {
      throw new NotFoundException("Unknown programme resource");
    }
    const key = resource as ResourceKey;
    return { key, config: RESOURCES[key] };
  }

  private async applicationMap() {
    const rows = await this.db
      .select({
        id: fellowshipApplications.id,
        name: fellowshipApplications.name,
        reference: fellowshipApplications.reference,
        email: fellowshipApplications.email,
      })
      .from(fellowshipApplications);
    return new Map(rows.map((row) => [row.id, row]));
  }

  private async applyApplication(
    row: Record<string, unknown>,
    config: ResourceConfig,
    apps: Map<string, { id: string; name: string; reference: string; email: string }>,
  ): Promise<Record<string, unknown>> {
    if (!config.applicationLinked) return row;
    const applicationId = typeof row.applicationId === "string" ? row.applicationId : "";
    const application = applicationId ? apps.get(applicationId) : undefined;
    const output: Record<string, unknown> = {
      ...row,
      applicationName: application?.name ?? "",
      applicationReference: application?.reference ?? "",
    };
    if (!output.candidateName && application) output.candidateName = application.name;
    if (!output.candidateEmail && application) output.candidateEmail = application.email;
    return output;
  }

  private async valuesFor(
    config: ResourceConfig,
    body: Record<string, unknown>,
    options: { public?: boolean; partial?: boolean } = {},
  ) {
    const allowed = options.public ? new Set(config.publicFields ?? []) : null;
    const values: Record<string, unknown> = { ...(config.defaultValues ?? {}) };
    for (const [key, field] of Object.entries(config.fields)) {
      if (allowed && !allowed.has(key)) continue;
      if (!(key in body)) continue;
      values[key] = normalizeValue(key, field, body[key]);
    }
    for (const [key, field] of Object.entries(config.fields)) {
      if (!field.required) continue;
      if (options.partial && !(key in body)) continue;
      const value = values[key];
      if (value === undefined || value === null || value === "") {
        throw new BadRequestException(`${key} is required`);
      }
    }
    for (const [key, value] of Object.entries(values)) {
      if (
        key.toLowerCase().endsWith("email") &&
        typeof value === "string" &&
        value &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
      ) {
        throw new BadRequestException("A valid email is required");
      }
    }
    return values;
  }

  private async decorate(
    resource: ResourceKey,
    row: Record<string, unknown>,
    apps: Map<string, { id: string; name: string; reference: string; email: string }>,
  ) {
    const config = RESOURCES[resource];
    const withApp = await this.applyApplication(row, config, apps);
    const output = { ...withApp } as Record<string, unknown>;
    if (resource === "fees") {
      const total = Number(output.totalAmount ?? 0);
      const scholarship = Number(output.scholarshipAmount ?? 0);
      const paid = Number(output.paidAmount ?? 0);
      const payable = Math.max(total - scholarship, 0);
      output.payableAmount = payable;
      output.balance = Math.max(payable - paid, 0);
      output.paymentStatus = moneyStatus(paid, payable, String(output.status ?? "pending"));
    }
    if (resource === "clients") {
      const contract = Number(output.contractValue ?? 0);
      const received = Number(output.receivedAmount ?? 0);
      output.balance = Math.max(contract - received, 0);
    }
    if (resource === "stipends") {
      const dueAt = output.dueAt ? new Date(String(output.dueAt)).getTime() : null;
      output.isDue =
        output.status !== "paid" &&
        output.status !== "hold" &&
        dueAt !== null &&
        dueAt <= Date.now();
    }
    if (resource === "questions") {
      output.isPublished = output.status === "published";
    }
    return serialize(output) as Record<string, unknown>;
  }

  async list(
    resource: string,
    query: { status?: string; q?: string; limit?: string } = {},
  ) {
    const { key, config } = this.config(resource);
    const rows = (await this.db
      .select()
      .from(config.table)
      .orderBy(desc(config.table.createdAt))) as Array<Record<string, unknown>>;
    const apps = await this.applicationMap();
    let items = await Promise.all(rows.map((row) => this.decorate(key, row, apps)));

    if (key === "sessions" || key === "questions") {
      const colleges = await this.db
        .select({ id: fellowshipColleges.id, name: fellowshipColleges.name })
        .from(fellowshipColleges);
      const byId = new Map(colleges.map((college) => [college.id, college.name]));
      items = items.map((row) => ({
        ...row,
        collegeName: byId.get(String(row.collegeId ?? "")) ?? "",
      }));
    }

    const status = sanitizeText(query.status, 80);
    if (status && status !== "all") {
      items = items.filter(
        (row) => row.status === status || row.stage === status || row.paymentStatus === status,
      );
    }
    const search = sanitizeText(query.q, 120).toLowerCase();
    if (search) {
      items = items.filter((row) =>
        Object.values(row).some((value) =>
          typeof value === "string" ? value.toLowerCase().includes(search) : false,
        ),
      );
    }
    const limit = Math.min(Math.max(Number(query.limit ?? 500) || 500, 1), 1000);

    const summary: Record<string, number> = {};
    for (const row of items) {
      const state = String(row.status ?? row.stage ?? "unknown");
      summary[state] = (summary[state] ?? 0) + 1;
    }

    return { items: items.slice(0, limit), summary };
  }

  async create(
    resource: string,
    body: Record<string, unknown>,
    options: { public?: boolean; actorEmail?: string | null } = {},
  ) {
    const { key, config } = this.config(resource);
    const values = await this.valuesFor(config, body, { public: options.public });

    if (config.applicationLinked && typeof values.applicationId === "string" && values.applicationId) {
      const [application] = await this.db
        .select()
        .from(fellowshipApplications)
        .where(eq(fellowshipApplications.id, values.applicationId))
        .limit(1);
      if (!application) throw new BadRequestException("Application not found");
      if (!values.candidateName) values.candidateName = application.name;
      if (!values.candidateEmail) values.candidateEmail = application.email;
    }
    if (resource === "fees") {
      values.status = moneyStatus(
        Number(values.paidAmount ?? 0),
        Math.max(Number(values.totalAmount ?? 0) - Number(values.scholarshipAmount ?? 0), 0),
        String(values.status ?? "pending"),
      );
    }
    if (resource === "stipends" && values.status === "paid" && !values.paidAt) {
      values.paidAt = new Date();
    }
    if (resource === "placements" && values.status === "joined" && !values.joinedAt) {
      values.joinedAt = new Date();
    }
    if (resource === "donations" && values.status === "received" && !values.receivedAt) {
      values.receivedAt = new Date();
    }
    if (resource === "questions" && values.status === "published" && !values.publishedAt) {
      values.publishedAt = new Date();
    }

    const [row] = (await this.db
      .insert(config.table)
      .values({ id: uuid(), ...values })
      .returning()) as Array<Record<string, unknown>>;
    const apps = await this.applicationMap();
    const item = await this.decorate(key, row, apps);

    await this.audit.log({
      actorEmail: options.actorEmail ?? "system",
      action: `${key}.created`,
      entityType: key,
      entityId: String(row.id),
      applicationId: typeof row.applicationId === "string" ? row.applicationId : null,
      detail: String(row.name ?? row.title ?? row.clientName ?? row.donorName ?? row.employer ?? ""),
    });
    return { item };
  }

  async update(
    resource: string,
    id: string,
    body: Record<string, unknown>,
    options: { actorEmail?: string | null } = {},
  ) {
    const { key, config } = this.config(resource);
    const [existing] = (await this.db
      .select()
      .from(config.table)
      .where(eq(config.table.id, id))
      .limit(1)) as Array<Record<string, unknown>>;
    if (!existing) throw new NotFoundException(`${config.label} not found`);

    const values = await this.valuesFor(config, body, { partial: true });
    if (config.applicationLinked && typeof values.applicationId === "string" && values.applicationId) {
      const [application] = await this.db
        .select()
        .from(fellowshipApplications)
        .where(eq(fellowshipApplications.id, values.applicationId))
        .limit(1);
      if (!application) throw new BadRequestException("Application not found");
      if (!values.candidateName) values.candidateName = application.name;
      if (!values.candidateEmail) values.candidateEmail = application.email;
    }
    if (resource === "fees") {
      const total = Number(values.totalAmount ?? existing.totalAmount ?? 0);
      const scholarship = Number(
        values.scholarshipAmount ?? existing.scholarshipAmount ?? 0,
      );
      values.status = moneyStatus(
        Number(values.paidAmount ?? existing.paidAmount ?? 0),
        Math.max(total - scholarship, 0),
        String(values.status ?? existing.status ?? "pending"),
      );
    }
    if (resource === "stipends") {
      if (values.status === "paid" && !values.paidAt && !existing.paidAt) {
        values.paidAt = new Date();
      }
      if (values.status && values.status !== "paid") {
        values.paidAt = null;
      }
    }
    if (resource === "placements" && values.status === "joined" && !values.joinedAt) {
      values.joinedAt = new Date();
    }
    if (resource === "donations" && values.status === "received" && !values.receivedAt) {
      values.receivedAt = new Date();
    }
    if (resource === "questions" && values.status === "published" && !values.publishedAt) {
      values.publishedAt = new Date();
    }

    const [row] = (await this.db
      .update(config.table)
      .set({ ...values, updatedAt: new Date() })
      .where(eq(config.table.id, id))
      .returning()) as Array<Record<string, unknown>>;
    const apps = await this.applicationMap();
    const item = await this.decorate(key, row, apps);

    await this.audit.log({
      actorEmail: options.actorEmail ?? "system",
      action: `${key}.updated`,
      entityType: key,
      entityId: id,
      applicationId: typeof row.applicationId === "string" ? row.applicationId : null,
      detail: String(row.status ?? ""),
    });
    return { item };
  }

  async remove(resource: string, id: string, actorEmail?: string | null) {
    const { key, config } = this.config(resource);
    const [row] = (await this.db
      .delete(config.table)
      .where(eq(config.table.id, id))
      .returning({ id: config.table.id })) as Array<{ id: string }>;
    if (!row) throw new NotFoundException(`${config.label} not found`);
    await this.audit.log({
      actorEmail: actorEmail ?? "system",
      action: `${key}.deleted`,
      entityType: key,
      entityId: id,
    });
    return { ok: true };
  }

  async generateStipends(body: Record<string, unknown>) {
    const applicationId = sanitizeText(body.applicationId, 80);
    if (!applicationId) throw new BadRequestException("Choose a fellow");
    const startMonth = Math.min(Math.max(Number(body.startMonth ?? 6) || 6, 1), 24);
    const endMonth = Math.min(Math.max(Number(body.endMonth ?? 12) || 12, startMonth), 24);
    const baseAmount = asNumber(body.baseAmount);
    const increasedAmount = asNumber(body.increasedAmount ?? body.baseAmount);
    if (baseAmount <= 0) throw new BadRequestException("Monthly amount must be greater than zero");
    if (increasedAmount < baseAmount) {
      throw new BadRequestException("The month-12 amount cannot be lower than the base amount");
    }
    const startDate = asDate(body.startDate) ?? new Date();

    const [application] = await this.db
      .select()
      .from(fellowshipApplications)
      .where(eq(fellowshipApplications.id, applicationId))
      .limit(1);
    if (!application) throw new BadRequestException("Application not found");

    const existing = await this.db
      .select({ monthNumber: fellowshipStipends.monthNumber })
      .from(fellowshipStipends)
      .where(eq(fellowshipStipends.applicationId, applicationId));
    const taken = new Set(existing.map((row) => row.monthNumber));

    let created = 0;
    let skipped = 0;
    for (let month = startMonth; month <= endMonth; month += 1) {
      if (taken.has(month)) {
        skipped += 1;
        continue;
      }
      const dueAt = new Date(startDate);
      dueAt.setMonth(dueAt.getMonth() + (month - 1));
      await this.db.insert(fellowshipStipends).values({
        id: uuid(),
        applicationId,
        candidateName: application.name,
        candidateEmail: application.email,
        monthNumber: month,
        amount: month >= 12 ? increasedAmount : baseAmount,
        status: "planned",
        dueAt,
      });
      created += 1;
    }

    await this.audit.log({
      action: "stipends.generated",
      entityType: "stipends",
      entityId: applicationId,
      applicationId,
      detail: `${created} created, ${skipped} existing`,
    });

    return { created, skipped, startMonth, endMonth };
  }

  async dashboard() {
    const [
      colleges,
      sessions,
      questions,
      content,
      inquiries,
      fees,
      stipends,
      clients,
      placements,
      donations,
      gurukulam,
    ] = await Promise.all([
      this.db.select().from(fellowshipColleges),
      this.db.select().from(fellowshipOutreachSessions),
      this.db.select().from(fellowshipOutreachQuestions),
      this.db.select().from(fellowshipContentItems),
      this.db.select().from(fellowshipInquiries),
      this.db.select().from(fellowshipFeePlans),
      this.db.select().from(fellowshipStipends),
      this.db.select().from(fellowshipClientEngagements),
      this.db.select().from(fellowshipPlacements),
      this.db.select().from(fellowshipDonations),
      this.db.select().from(gurukulamInterests),
    ]);

    const now = Date.now();
    const sum = (rows: Array<{ amount?: number }>) =>
      rows.reduce((total, row) => total + Number(row.amount ?? 0), 0);
    const feeBilled = fees.reduce(
      (total, row) =>
        total + Math.max(row.totalAmount - row.scholarshipAmount, 0),
      0,
    );
    const feeCollected = fees.reduce((total, row) => total + row.paidAmount, 0);
    const clientValue = clients.reduce(
      (total, row) => total + row.contractValue,
      0,
    );
    const clientReceived = clients.reduce(
      (total, row) => total + row.receivedAmount,
      0,
    );

    return {
      colleges: {
        total: colleges.length,
        contacted: colleges.filter((row) => row.stage !== "identified").length,
        sessions: colleges.filter((row) => row.stage === "session" || row.stage === "partner").length,
        followUpsDue: colleges.filter(
          (row) => row.nextFollowUpAt && row.nextFollowUpAt.getTime() <= now,
        ).length,
      },
      sessions: {
        planned: sessions.filter((row) => row.status === "planned").length,
        completed: sessions.filter((row) => row.status === "completed").length,
      },
      questions: {
        open: questions.filter((row) => row.status === "open").length,
        published: questions.filter((row) => row.status === "published").length,
      },
      content: {
        ideas: content.filter((row) => row.status === "idea").length,
        drafts: content.filter((row) => row.status === "draft" || row.status === "review").length,
        scheduled: content.filter((row) => row.status === "scheduled").length,
        published: content.filter((row) => row.status === "published").length,
      },
      care: {
        new: inquiries.filter((row) => row.status === "new").length,
        open: inquiries.filter(
          (row) => row.status === "new" || row.status === "in_progress" || row.status === "waiting",
        ).length,
        overdue: inquiries.filter(
          (row) =>
            row.callbackAt &&
            row.callbackAt.getTime() <= now &&
            row.status !== "resolved" &&
            row.status !== "closed",
        ).length,
      },
      fees: {
        billed: feeBilled,
        collected: feeCollected,
        outstanding: Math.max(feeBilled - feeCollected, 0),
        pending: fees.filter((row) => row.status === "pending" || row.status === "partial").length,
      },
      payroll: {
        dueAmount: sum(
          stipends.filter(
            (row) =>
              (row.status === "planned" || row.status === "approved") &&
              row.dueAt !== null &&
              row.dueAt.getTime() <= now,
          ),
        ),
        paidAmount: sum(stipends.filter((row) => row.status === "paid")),
        planned: stipends.filter((row) => row.status === "planned").length,
      },
      clients: {
        active: clients.filter((row) => row.status === "active").length,
        contractValue: clientValue,
        received: clientReceived,
        outstanding: Math.max(clientValue - clientReceived, 0),
      },
      placements: {
        offers: placements.filter((row) => row.status === "offer" || row.status === "accepted").length,
        joined: placements.filter((row) => row.status === "joined").length,
      },
      donations: {
        pledged: sum(donations.filter((row) => row.status === "pledged")),
        received: sum(donations.filter((row) => row.status === "received" || row.status === "thanked")),
        count: donations.length,
      },
      gurukulam: {
        total: gurukulam.length,
        new: gurukulam.filter((row) => row.status === "new").length,
        returners: gurukulam.filter((row) => row.kind === "returner").length,
      },
    };
  }

  async publicFaqs() {
    const rows = await this.db
      .select()
      .from(fellowshipOutreachQuestions)
      .where(ne(fellowshipOutreachQuestions.answer, ""))
      .orderBy(desc(fellowshipOutreachQuestions.publishedAt));
    return {
      faqs: rows
        .filter((row) => row.status === "published")
        .slice(0, 40)
        .map((row) => ({
          id: row.id,
          audience: row.audience,
          question: row.question,
          answer: row.answer,
        })),
    };
  }

  private async notify(subject: string, body: string, replyTo?: string) {
    try {
      const to = (await this.settings.contactEmail()) || env.CONTACT_EMAIL;
      if (!to) return;
      await sendContactEmail({
        name: "Programme website",
        email: replyTo || to,
        phone: "",
        service: subject,
        message: body,
        to,
      });
    } catch (error) {
      this.logger.warn(
        `Programme notification failed (${subject}): ${
          error instanceof Error ? error.message : "unknown error"
        }`,
      );
    }
  }

  async publicInquiry(body: Record<string, unknown>) {
    const name = sanitizeText(body.name, 160);
    const email = sanitizeText(body.email, 254).toLowerCase();
    const phone = sanitizeText(body.phone, 40);
    const message = sanitizeText(body.message, 8000);
    if (!name || !message) throw new BadRequestException("Name and message are required");
    if (!email && !phone) throw new BadRequestException("Add an email address or phone number");
    const { item } = await this.create("inquiries", body, { public: true });
    await this.notify(
      "Fellowship enquiry",
      `Name: ${name}\nEmail: ${email || "—"}\nPhone: ${phone || "—"}\nCategory: ${String(item.category ?? "")}\n\n${message}`,
      email || undefined,
    );
    return { ok: true, id: item.id };
  }

  async publicGurukulamInterest(body: Record<string, unknown>) {
    const name = sanitizeText(body.name, 160);
    const email = sanitizeText(body.email, 254).toLowerCase();
    const phone = sanitizeText(body.phone, 40);
    if (!name) throw new BadRequestException("Name is required");
    if (!email && !phone) throw new BadRequestException("Add an email address or phone number");
    const { item } = await this.create("gurukulam", body, { public: true });
    await this.notify(
      "Gurukulam interest",
      `Name: ${name}\nEmail: ${email || "—"}\nPhone: ${phone || "—"}\nKind: ${String(item.kind ?? "")}\nCity: ${String(item.city ?? "")}\n\nGoal: ${String(item.goal ?? "")}`,
      email || undefined,
    );
    return { ok: true, id: item.id };
  }

  async publicDonationPledge(body: Record<string, unknown>) {
    const donorName = sanitizeText(body.donorName, 160);
    const amount = asNumber(body.amount);
    if (!donorName) throw new BadRequestException("Name is required");
    if (amount <= 0) throw new BadRequestException("Enter a pledge amount");
    const { item } = await this.create("donations", body, { public: true });
    await this.notify(
      "Fellowship donation pledge",
      `Donor: ${donorName}\nAmount: ₹${amount}\nPurpose: ${String(item.purpose ?? "")}\nRecognition preference: ${String(item.rewardPreference ?? "")}\n\n${String(item.notes ?? "")}`,
      sanitizeText(body.email, 254) || undefined,
    );
    return { ok: true, id: item.id };
  }
}
