export type ProgrammeFieldKind =
  | "text"
  | "textarea"
  | "number"
  | "date"
  | "select"
  | "checkbox"
  | "application"
  | "college";

export type ProgrammeField = {
  key: string;
  label: string;
  kind: ProgrammeFieldKind;
  options?: Array<{ value: string; label: string }>;
  required?: boolean;
  table?: boolean;
  readOnly?: boolean;
  placeholder?: string;
  help?: string;
  wide?: boolean;
};

export type ProgrammeResource = {
  key: string;
  endpoint: string;
  label: string;
  singular: string;
  description: string;
  fields: ProgrammeField[];
  allowDelete?: boolean;
};

const options = (values: readonly string[]) =>
  values.map((value) => ({
    value,
    label: value
      .split("_")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" "),
  }));

export const COLLEGE_STAGES = [
  "identified",
  "contacted",
  "meeting",
  "session",
  "partner",
  "not_interested",
] as const;
export const CONTENT_STATUSES = [
  "idea",
  "draft",
  "review",
  "scheduled",
  "published",
] as const;
export const INQUIRY_STATUSES = [
  "new",
  "in_progress",
  "waiting",
  "resolved",
  "closed",
] as const;
export const FEE_STATUSES = ["pending", "partial", "paid", "waived", "cancelled"] as const;
export const STIPEND_STATUSES = ["planned", "approved", "paid", "hold"] as const;
export const CLIENT_STATUSES = ["lead", "proposal", "active", "completed", "cancelled"] as const;
export const PLACEMENT_STATUSES = ["offer", "accepted", "joined", "declined", "dropped"] as const;
export const DONATION_STATUSES = ["pledged", "received", "thanked", "refunded"] as const;
export const GURUKULAM_STATUSES = ["new", "contacted", "eligible", "enrolled", "closed"] as const;

export type ProgrammeApplicationOption = {
  id: string;
  name: string;
  reference: string;
  email: string;
};

export type ProgrammeCollegeOption = {
  id: string;
  name: string;
};

export const PROGRAMME_RESOURCES: ProgrammeResource[] = [
  {
    key: "colleges",
    endpoint: "/api/fellowship-programme/admin/colleges",
    label: "Colleges",
    singular: "College",
    description: "Priority list, contacts, stage and next follow-up for college outreach.",
    fields: [
      { key: "name", label: "College", kind: "text", required: true, table: true },
      { key: "district", label: "District", kind: "text", table: true },
      { key: "state", label: "State", kind: "text" },
      { key: "type", label: "Type", kind: "text", placeholder: "Degree / polytechnic / engineering" },
      { key: "contactName", label: "Contact", kind: "text", table: true },
      { key: "contactRole", label: "Role", kind: "text" },
      { key: "email", label: "Email", kind: "text" },
      { key: "phone", label: "Phone", kind: "text", table: true },
      {
        key: "stage",
        label: "Stage",
        kind: "select",
        options: options(COLLEGE_STAGES),
        table: true,
      },
      {
        key: "priority",
        label: "Priority",
        kind: "select",
        options: options(["low", "medium", "high"]),
        table: true,
      },
      { key: "lastContactedAt", label: "Last contact", kind: "date" },
      { key: "nextFollowUpAt", label: "Next follow-up", kind: "date", table: true },
      { key: "notes", label: "Notes", kind: "textarea", wide: true },
    ],
  },
  {
    key: "sessions",
    endpoint: "/api/fellowship-programme/admin/sessions",
    label: "Sessions",
    singular: "Session",
    description: "Classroom, parent and management sessions with attendance.",
    fields: [
      { key: "collegeId", label: "College", kind: "college", table: true },
      { key: "title", label: "Session", kind: "text", required: true, table: true },
      { key: "scheduledAt", label: "Date", kind: "date", required: true, table: true },
      {
        key: "mode",
        label: "Mode",
        kind: "select",
        options: options(["online", "offline"]),
        table: true,
      },
      {
        key: "audience",
        label: "Audience",
        kind: "select",
        options: options(["students", "parents", "management", "mixed"]),
        table: true,
      },
      {
        key: "status",
        label: "Status",
        kind: "select",
        options: options(["planned", "completed", "cancelled"]),
        table: true,
      },
      { key: "attendees", label: "Attendees", kind: "number", table: true },
      { key: "owner", label: "Owner", kind: "text" },
      { key: "notes", label: "Notes", kind: "textarea", wide: true },
    ],
  },
  {
    key: "questions",
    endpoint: "/api/fellowship-programme/admin/questions",
    label: "Field FAQs",
    singular: "Question",
    description: "Questions from students, parents and college management. Published answers appear on the public FAQ.",
    fields: [
      { key: "collegeId", label: "College", kind: "college", table: true },
      {
        key: "audience",
        label: "Audience",
        kind: "select",
        options: options(["student", "parent", "management"]),
        table: true,
      },
      { key: "question", label: "Question", kind: "textarea", required: true, table: true, wide: true },
      { key: "answer", label: "Answer", kind: "textarea", wide: true },
      {
        key: "status",
        label: "Status",
        kind: "select",
        options: options(["open", "answered", "published"]),
        table: true,
      },
      { key: "askedAt", label: "Asked on", kind: "date" },
      { key: "publishedAt", label: "Published on", kind: "date", table: true },
      { key: "notes", label: "Internal notes", kind: "textarea", wide: true },
    ],
  },
  {
    key: "content",
    endpoint: "/api/fellowship-programme/admin/content",
    label: "Content",
    singular: "Content item",
    description: "Posters, photos, video, audio, YouTube, social posts and manual performance numbers.",
    fields: [
      { key: "title", label: "Title", kind: "text", required: true, table: true },
      {
        key: "type",
        label: "Type",
        kind: "select",
        options: options(["poster", "photo", "video", "audio", "youtube", "social_post", "poll", "blog"]),
        table: true,
      },
      {
        key: "channel",
        label: "Channel",
        kind: "select",
        options: options(["instagram", "linkedin", "facebook", "youtube", "website", "offline"]),
        table: true,
      },
      {
        key: "status",
        label: "Status",
        kind: "select",
        options: options(CONTENT_STATUSES),
        table: true,
      },
      { key: "owner", label: "Owner", kind: "text" },
      { key: "dueAt", label: "Due", kind: "date", table: true },
      { key: "publishedAt", label: "Published", kind: "date" },
      { key: "url", label: "URL", kind: "text", wide: true },
      { key: "impressions", label: "Impressions", kind: "number", table: true },
      { key: "engagements", label: "Engagements", kind: "number", table: true },
      { key: "comments", label: "Comments", kind: "number" },
      { key: "leads", label: "Leads", kind: "number", table: true },
      { key: "notes", label: "Notes", kind: "textarea", wide: true },
    ],
  },
  {
    key: "inquiries",
    endpoint: "/api/fellowship-programme/admin/inquiries",
    label: "Care queue",
    singular: "Enquiry",
    description: "Calls, WhatsApp, email and website enquiries with callback and resolution tracking.",
    fields: [
      { key: "name", label: "Name", kind: "text", required: true, table: true },
      { key: "phone", label: "Phone", kind: "text", table: true },
      { key: "email", label: "Email", kind: "text" },
      {
        key: "channel",
        label: "Channel",
        kind: "select",
        options: options(["website", "phone", "whatsapp", "email", "social", "walk_in"]),
        table: true,
      },
      {
        key: "category",
        label: "Category",
        kind: "select",
        options: options(["admissions", "fees", "college", "parent", "support", "returner", "other"]),
        table: true,
      },
      { key: "subject", label: "Subject", kind: "text", wide: true },
      { key: "message", label: "Message", kind: "textarea", required: true, wide: true },
      {
        key: "status",
        label: "Status",
        kind: "select",
        options: options(INQUIRY_STATUSES),
        table: true,
      },
      {
        key: "priority",
        label: "Priority",
        kind: "select",
        options: options(["low", "medium", "high"]),
        table: true,
      },
      { key: "owner", label: "Owner", kind: "text", table: true },
      { key: "callbackAt", label: "Callback", kind: "date", table: true },
      { key: "resolution", label: "Resolution", kind: "textarea", wide: true },
    ],
  },
  {
    key: "fees",
    endpoint: "/api/fellowship-programme/admin/fees",
    label: "Fees",
    singular: "Fee plan",
    description: "Offline programme contribution ledger. The website does not collect payment.",
    fields: [
      { key: "applicationId", label: "Fellow", kind: "application", table: true },
      { key: "candidateName", label: "Name (if no application)", kind: "text" },
      { key: "candidateEmail", label: "Email (if no application)", kind: "text" },
      { key: "programme", label: "Programme", kind: "text", table: true },
      { key: "totalAmount", label: "Total (₹)", kind: "number", table: true },
      { key: "scholarshipAmount", label: "Scholarship (₹)", kind: "number" },
      { key: "paidAmount", label: "Paid (₹)", kind: "number", table: true },
      {
        key: "status",
        label: "Status",
        kind: "select",
        options: options(FEE_STATUSES),
      },
      { key: "balance", label: "Balance", kind: "number", table: true, readOnly: true },
      {
        key: "paymentStatus",
        label: "Payment",
        kind: "text",
        table: true,
        readOnly: true,
      },
      { key: "dueAt", label: "Due", kind: "date", table: true },
      { key: "notes", label: "Notes", kind: "textarea", wide: true },
    ],
  },
  {
    key: "stipends",
    endpoint: "/api/fellowship-programme/admin/stipends",
    label: "Payroll",
    singular: "Stipend",
    description: "Month-by-month intern stipend schedule. Generate months 6–12 with the month-12 increase.",
    fields: [
      { key: "applicationId", label: "Fellow", kind: "application", table: true },
      { key: "candidateName", label: "Name (if no application)", kind: "text" },
      { key: "candidateEmail", label: "Email (if no application)", kind: "text" },
      { key: "monthNumber", label: "Month", kind: "number", table: true },
      { key: "amount", label: "Amount (₹)", kind: "number", table: true },
      {
        key: "status",
        label: "Status",
        kind: "select",
        options: options(STIPEND_STATUSES),
        table: true,
      },
      { key: "dueAt", label: "Due", kind: "date", table: true },
      { key: "paidAt", label: "Paid", kind: "date", table: true },
      { key: "isDue", label: "Due now", kind: "checkbox", table: true, readOnly: true },
      { key: "mode", label: "Mode", kind: "text" },
      { key: "reference", label: "Reference", kind: "text" },
      { key: "notes", label: "Notes", kind: "textarea", wide: true },
    ],
  },
  {
    key: "clients",
    endpoint: "/api/fellowship-programme/admin/clients",
    label: "Client work",
    singular: "Engagement",
    description: "Client projects that fund the company and host fellow work.",
    fields: [
      { key: "clientName", label: "Client", kind: "text", required: true, table: true },
      { key: "projectTitle", label: "Project", kind: "text", table: true },
      { key: "description", label: "Description", kind: "textarea", wide: true },
      { key: "contractValue", label: "Contract (₹)", kind: "number", table: true },
      { key: "receivedAmount", label: "Received (₹)", kind: "number", table: true },
      {
        key: "status",
        label: "Status",
        kind: "select",
        options: options(CLIENT_STATUSES),
        table: true,
      },
      { key: "balance", label: "Balance", kind: "number", table: true, readOnly: true },
      { key: "startAt", label: "Start", kind: "date" },
      { key: "endAt", label: "End", kind: "date" },
      { key: "owner", label: "Owner", kind: "text", table: true },
      { key: "notes", label: "Notes", kind: "textarea", wide: true },
    ],
  },
  {
    key: "placements",
    endpoint: "/api/fellowship-programme/admin/placements",
    label: "Placements",
    singular: "Placement",
    description: "Offers, joins and packages after the fellowship.",
    fields: [
      { key: "applicationId", label: "Fellow", kind: "application", table: true },
      { key: "candidateName", label: "Name (if no application)", kind: "text" },
      { key: "candidateEmail", label: "Email (if no application)", kind: "text" },
      { key: "employer", label: "Employer", kind: "text", required: true, table: true },
      { key: "role", label: "Role", kind: "text", table: true },
      { key: "packageAmount", label: "Package (₹/year)", kind: "number", table: true },
      {
        key: "status",
        label: "Status",
        kind: "select",
        options: options(PLACEMENT_STATUSES),
        table: true,
      },
      { key: "source", label: "Source", kind: "text" },
      { key: "offerAt", label: "Offer date", kind: "date" },
      { key: "joinedAt", label: "Joined", kind: "date", table: true },
      { key: "notes", label: "Notes", kind: "textarea", wide: true },
    ],
  },
  {
    key: "donations",
    endpoint: "/api/fellowship-programme/admin/donations",
    label: "Donations",
    singular: "Donation",
    description: "Pledges, receipts and recognition preferences. No online payment is collected.",
    fields: [
      { key: "donorName", label: "Donor", kind: "text", required: true, table: true },
      { key: "email", label: "Email", kind: "text" },
      { key: "phone", label: "Phone", kind: "text" },
      { key: "amount", label: "Amount (₹)", kind: "number", table: true },
      { key: "purpose", label: "Purpose", kind: "text", table: true },
      {
        key: "status",
        label: "Status",
        kind: "select",
        options: options(DONATION_STATUSES),
        table: true,
      },
      { key: "rewardPreference", label: "Recognition", kind: "text", table: true },
      { key: "anonymous", label: "Anonymous", kind: "checkbox" },
      { key: "receivedAt", label: "Received", kind: "date", table: true },
      { key: "mode", label: "Mode", kind: "text" },
      { key: "reference", label: "Reference", kind: "text" },
      { key: "notes", label: "Notes", kind: "textarea", wide: true },
    ],
  },
  {
    key: "gurukulam",
    endpoint: "/api/fellowship-programme/admin/gurukulam",
    label: "Gurukulam",
    singular: "Interest",
    description: "Gurukulam and returner leads. Convert a lead into a fellowship application when ready.",
    fields: [
      { key: "name", label: "Name", kind: "text", required: true, table: true },
      { key: "email", label: "Email", kind: "text" },
      { key: "phone", label: "Phone", kind: "text", table: true },
      { key: "city", label: "City", kind: "text", table: true },
      {
        key: "kind",
        label: "Track",
        kind: "select",
        options: [
          { value: "gurukulam", label: "Gurukulam" },
          { value: "returner", label: "Returner" },
        ],
        table: true,
      },
      {
        key: "status",
        label: "Status",
        kind: "select",
        options: options(GURUKULAM_STATUSES),
        table: true,
      },
      { key: "background", label: "Background", kind: "textarea", wide: true },
      { key: "goal", label: "Goal", kind: "textarea", wide: true },
      { key: "applicationId", label: "Application", kind: "application" },
      { key: "notes", label: "Notes", kind: "textarea", wide: true },
    ],
  },
];

export const programmeResource = (key: string): ProgrammeResource =>
  PROGRAMME_RESOURCES.find((resource) => resource.key === key) ?? PROGRAMME_RESOURCES[0];

export const formatProgrammeDate = (value: unknown): string => {
  if (!value) return "—";
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const formatMoney = (value: unknown): string => {
  const amount = Number(value ?? 0);
  if (!Number.isFinite(amount)) return "₹0";
  return `₹${amount.toLocaleString("en-IN")}`;
};

export const programmeStatusTone = (value: unknown): string => {
  const status = String(value ?? "");
  if (["paid", "published", "completed", "joined", "partner", "resolved", "thanked", "enrolled"].includes(status)) {
    return "border-emerald-500/30 bg-emerald-500/10 text-emerald-600";
  }
  if (["active", "approved", "session", "received", "eligible"].includes(status)) {
    return "border-blue-500/30 bg-blue-500/10 text-blue-600";
  }
  if (["partial", "in_progress", "meeting", "review", "scheduled", "contacted", "waiting"].includes(status)) {
    return "border-amber-500/30 bg-amber-500/10 text-amber-600";
  }
  if (["cancelled", "closed", "declined", "dropped", "refunded", "not_interested", "hold"].includes(status)) {
    return "border-rose-500/30 bg-rose-500/10 text-rose-600";
  }
  return "border-border bg-muted/50 text-muted-foreground";
};
