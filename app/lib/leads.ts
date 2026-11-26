/* Shared vocabulary for the private lead inbox. Keep in sync with
   api/src/db/drizzle/schema.ts (LEAD_SERVICES / LEAD_STATUSES). */

export const LEAD_SERVICES = [
  "survey",
  "fellow",
  "financial",
  "government",
  "farms",
  "gurukulam",
  "contact",
] as const;
export type LeadService = (typeof LEAD_SERVICES)[number];

export const LEAD_STATUSES = ["new", "contacted", "qualified", "won", "lost"] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const LEAD_SERVICE_LABELS: Record<LeadService, string> = {
  survey: "Survey & Research",
  fellow: "Fellowship",
  financial: "Financial Services",
  government: "Government Technology",
  farms: "Kavi Farms",
  gurukulam: "Gurukulam",
  contact: "General contact",
};

export const LEAD_SERVICE_BLURBS: Record<LeadService, string> = {
  survey: "Client projects and surveyor registrations",
  fellow: "Applications to the Kavi Fellowship",
  financial: "Individual and business enquiries",
  government: "Public-sector modernisation enquiries",
  farms: "Farm products and village tourism",
  gurukulam: "Long-term learning and earning pathways",
  contact: "Messages from the main contact form",
};

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  won: "Won",
  lost: "Lost",
};

export const LEAD_STATUS_TONES: Record<LeadStatus, string> = {
  new: "bg-blue-500/10 text-blue-600 ring-blue-500/20 dark:text-blue-300",
  contacted: "bg-amber-500/10 text-amber-600 ring-amber-500/20 dark:text-amber-300",
  qualified: "bg-violet-500/10 text-violet-600 ring-violet-500/20 dark:text-violet-300",
  won: "bg-emerald-500/10 text-emerald-600 ring-emerald-500/20 dark:text-emerald-300",
  lost: "bg-slate-500/10 text-slate-600 ring-slate-500/20 dark:text-slate-300",
};

export type Lead = {
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

export type LeadListResponse = { leads: Lead[]; counts: LeadCounts };

export const isLeadService = (value: string | null): value is LeadService =>
  value !== null && (LEAD_SERVICES as readonly string[]).includes(value);

export const isLeadStatus = (value: string): value is LeadStatus =>
  (LEAD_STATUSES as readonly string[]).includes(value);
