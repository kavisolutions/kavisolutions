export type CertificateType = "fellowship" | "volunteer" | "internship" | "mentorship" | "experience";

export type CertificateStatus = "issued" | "revoked";

export const CERTIFICATE_TYPES: CertificateType[] = [
  "fellowship",
  "volunteer",
  "internship",
  "mentorship",
  "experience",
];

export const CERTIFICATE_TYPE_LABELS: Record<CertificateType, string> = {
  fellowship: "Certificate of Fellowship Completion",
  volunteer: "Certificate of Voluntary Service",
  internship: "Internship Completion Certificate",
  mentorship: "Certificate of Appreciation",
  experience: "Experience Certificate",
};

export const CERTIFICATE_ID_PATTERN = /^KV-(FEL|VOL|INT|MEN|EXP)-\d{4}-\d{4}$/;

/* Certificate IDs look like KV-FEL-2026-0001. It is the only identifier that
   appears in the QR code and on the printed document, so it is validated
   before touching the database. */
export function isCertificateId(value: unknown): value is string {
  return typeof value === "string" && CERTIFICATE_ID_PATTERN.test(value.trim());
}

export function normalizeCertificateId(value: string): string {
  return value.trim().toUpperCase();
}

export function isCertificateType(value: unknown): value is CertificateType {
  return typeof value === "string" && (CERTIFICATE_TYPES as string[]).includes(value);
}

/* A certificate is publicly verifiable only while `status` is "issued".
   Revoked certificates still resolve, but the lookup result must say so
   instead of pretending the document is valid. */
export function isVerifiable(status: string | null | undefined): boolean {
  return (status ?? "issued") === "issued";
}

export const REDACTED_RECIPIENT = "Withheld";

/* Public verification shows the recipient name so a third party can match the
   document to its holder. Revoked records hide the name to avoid leaking
   personal data for a document that is no longer valid. */
export function publicRecipientName(
  name: string,
  status: string | null | undefined,
): string {
  return isVerifiable(status) ? name : REDACTED_RECIPIENT;
}
