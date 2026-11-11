export type CertificateType = "fellowship" | "volunteer" | "internship" | "mentorship" | "experience";

export type CertificateStatus = "issued" | "revoked";

export type PublicCertificate = {
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
  status: CertificateStatus;
};

/* What GET /api/certificates returns to an admin. The extra audit fields are
   never part of the public lookup. */
export type AdminCertificate = PublicCertificate & {
  revokedOn: string | null;
  revokedReason: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CertificateDraft = {
  id: string;
  type: CertificateType;
  recipientName: string;
  programme: string;
  role: string;
  startDate: string;
  endDate: string;
  issuedOn: string;
  summary: string;
};

export const CERTIFICATE_TYPE_LABELS: Record<CertificateType, string> = {
  fellowship: "Fellowship Completion",
  volunteer: "Voluntary Service",
  internship: "Internship Completion",
  mentorship: "Appreciation & Mentorship",
  experience: "Experience",
};

export const CERTIFICATE_ID_EXAMPLE = "KV-FEL-2026-0001";

/* The ID encodes the type, so the admin form derives one from the other:
   picking "Internship" must produce a KV-INT prefix, not a mismatched KV-FEL. */
export const CERTIFICATE_TYPE_PREFIXES: Record<CertificateType, string> = {
  fellowship: "FEL",
  volunteer: "VOL",
  internship: "INT",
  mentorship: "MEN",
  experience: "EXP",
};

export function certificateTypeFromId(
  id: string,
): CertificateType | null {
  const match = /^KV-(FEL|VOL|INT|MEN|EXP)-/.exec(id.trim().toUpperCase());
  if (!match) return null;
  const entry = Object.entries(CERTIFICATE_TYPE_PREFIXES).find(([, prefix]) => prefix === match[1]);
  return (entry?.[0] as CertificateType | undefined) ?? null;
}

/* Rewrites the type prefix of an ID when the admin changes the type dropdown.
   Incomplete IDs are left alone so typing is not fought mid-keystroke. */
export function retypeCertificateId(id: string, prefix: string): string {
  const trimmed = id.trim().toUpperCase();
  if (!trimmed) return "";
  const match = /^KV-(FEL|VOL|INT|MEN|EXP)(-.*)?$/.exec(trimmed);
  if (!match) return id;
  return `KV-${prefix}${match[2] ?? ""}`;
}

/* IDs are KV-<TYPE>-<YEAR>-<SERIAL>. The serial is the only free part, so the
   form pre-fills the rest to keep issued IDs uniform. */
export function buildCertificateId(
  type: CertificateType,
  year: number,
  serial: string,
): string {
  return `KV-${CERTIFICATE_TYPE_PREFIXES[type]}-${year}-${serial.padStart(4, "0")}`;
}

/* Issues online on a Sunday or on any other day — no weekday logic here. */
export function todayIso(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}


const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/* Certificates store dates as ISO `YYYY-MM-DD` strings. The verify page shows
   them the same way they read on the printed certificate: "3 April 2026". */
export function formatCertificateDate(value: string | null | undefined): string {
  if (!value) return "";
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return value;
  const [, year, month, day] = match;
  const name = MONTHS[Number(month) - 1];
  if (!name) return value;
  return `${Number(day)} ${name} ${year}`;
}

export function formatCertificatePeriod(
  start: string | null | undefined,
  end: string | null | undefined,
): string {
  const from = formatCertificateDate(start);
  const to = formatCertificateDate(end);
  if (from && to) return `${from} — ${to}`;
  return from || to;
}

export type CertificateIdValidation =
  | { valid: true; id: string }
  | { valid: false; reason: string };

/* Mirrors the API rule so the page can reject obvious typos before a request. */
export function normalizeCertificateIdInput(raw: string): CertificateIdValidation {
  const id = raw.trim().toUpperCase();
  if (!id) return { valid: false, reason: "Enter a certificate ID to continue." };

  const match = /^KV-(FEL|VOL|INT|MEN|EXP)-(\d{4})-(\d{4})$/.exec(id);
  if (!match) {
    return {
      valid: false,
      reason: `Certificate IDs look like ${CERTIFICATE_ID_EXAMPLE}.`,
    };
  }

  const year = Number(match[2]);
  if (year < 2020 || year > 2100) {
    return { valid: false, reason: "That issue year does not look right." };
  }

  return { valid: true, id };
}
