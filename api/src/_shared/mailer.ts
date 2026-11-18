import nodemailer, { type Transporter } from "nodemailer";

import { env } from "@/config/env";

let transporter: Transporter | null = null;

const getTransporter = (): Transporter => {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    auth: env.SMTP_USER && env.SMTP_PASS ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
  });

  return transporter;
};

const fromAddress = (): string => `"Kavi Solutions" <${env.SMTP_USER ?? "no-reply@kavisolutions.in"}>`;

export type ContactMailInput = {
  name: string;
  email: string;
  phone: string;
  service?: string;
  message: string;
  to: string;
};

export async function sendContactEmail(input: ContactMailInput): Promise<void> {
  await getTransporter().sendMail({
    from: `"Kavi Solutions Website" <${env.SMTP_USER}>`,
    to: input.to,
    replyTo: input.email,
    subject: `New Contact Form - ${input.service || "General Inquiry"}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#06060b;color:#e0e0e0;border-radius:12px;">
        <h2 style="color:#a78bfa;">New message from kavisolutions.in</h2>
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:8px 0;color:#a1a1b5;font-weight:bold;">Name</td><td style="padding:8px 0;">${escapeHtml(input.name)}</td></tr>
          <tr><td style="padding:8px 0;color:#a1a1b5;font-weight:bold;">Email</td><td style="padding:8px 0;"><a href="mailto:${escapeHtml(input.email)}" style="color:#22d3ee;">${escapeHtml(input.email)}</a></td></tr>
          <tr><td style="padding:8px 0;color:#a1a1b5;font-weight:bold;">Phone</td><td style="padding:8px 0;"><a href="tel:${escapeHtml(input.phone)}" style="color:#22d3ee;">${escapeHtml(input.phone)}</a></td></tr>
          <tr><td style="padding:8px 0;color:#a1a1b5;font-weight:bold;">Service</td><td style="padding:8px 0;">${escapeHtml(input.service || "Not specified")}</td></tr>
        </table>
        <div style="margin-top:16px;padding:16px;background:#0b0b14;border-radius:8px;border:1px solid rgba(255,255,255,0.1);">
          <p style="color:#a1a1b5;font-weight:bold;margin:0 0 8px;">Message</p>
          <p style="margin:0;white-space:pre-wrap;">${escapeHtml(input.message)}</p>
        </div>
        <p style="margin-top:16px;color:#6e6e85;font-size:12px;">Sent from kavisolutions.in contact form</p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
  await getTransporter().sendMail({
    from: fromAddress(),
    to,
    subject: "Reset your Kavi Solutions password",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
        <h2 style="color:#6d28d9;">Reset your password</h2>
        <p>Someone requested a password reset for your Kavi Solutions account.</p>
        <p><a href="${escapeHtml(resetUrl)}" style="display:inline-block;padding:12px 20px;background:#6d28d9;color:#fff;border-radius:8px;text-decoration:none;">Reset password</a></p>
        <p style="color:#666;font-size:12px;">If you did not request this, you can safely ignore this email.</p>
      </div>
    `,
  });
}

export type SurveyorRegisteredMailInput = {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  languages: string[];
  skills: string[];
  experience: string;
  status: string;
  to: string;
};

/* Internal notification when someone joins the surveyor network. The visitor
   already gets a confirmation on screen, so this goes to the team only. */
export async function sendSurveyorRegisteredEmail(
  input: SurveyorRegisteredMailInput,
): Promise<void> {
  const rows: Array<[string, string]> = [
    ["Name", input.name],
    ["Email", input.email],
    ["Phone", input.phone],
    ["Location", input.location || "—"],
    ["Languages", input.languages.join(", ") || "—"],
    ["Skills", input.skills.join(", ") || "—"],
    ["Status", input.status],
    ["Record ID", input.id],
  ];

  await getTransporter().sendMail({
    from: `"Kavi Survey Website" <${env.SMTP_USER}>`,
    to: input.to,
    replyTo: input.email,
    subject: `[Kavi Survey] New surveyor registration — ${input.name}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#06060b;color:#e0e0e0;border-radius:12px;">
        <p style="margin:0 0 4px;color:#0d7a6b;font-size:12px;font-weight:bold;text-transform:uppercase;letter-spacing:1px;">
          Surveyor network registration
        </p>
        <h2 style="color:#ffffff;margin:0 0 16px;">New surveyor profile</h2>
        <table style="width:100%;border-collapse:collapse;">
          ${rows
            .map(
              ([label, value]) => `<tr>
            <td style="padding:8px 0;color:#a1a1b5;font-weight:bold;width:140px;">${escapeHtml(label)}</td>
            <td style="padding:8px 0;">${escapeHtml(value)}</td>
          </tr>`,
            )
            .join("")}
        </table>
        <div style="margin-top:16px;padding:16px;background:#0b0b14;border-radius:8px;border:1px solid rgba(255,255,255,0.1);">
          <p style="color:#a1a1b5;font-weight:bold;margin:0 0 8px;">Experience</p>
          <p style="margin:0;white-space:pre-wrap;">${escapeHtml(input.experience || "Not provided")}</p>
        </div>
        <p style="margin-top:16px;color:#6e6e85;font-size:12px;">
          Review and verify this profile in the admin console under Surveyors.
        </p>
      </div>
    `,
  });
}

export type FinancialEnquiryKind = "individual" | "business";

export type FinancialEnquiryMailInput = {
  kind: FinancialEnquiryKind;
  name: string;
  email: string;
  phone: string;
  organisation?: string;
  entityType?: string;
  service?: string;
  financialYear?: string;
  message: string;
  to: string;
};

const FINANCIAL_LABEL: Record<FinancialEnquiryKind, string> = {
  individual: "Individual financial enquiry",
  business: "Business financial enquiry",
};

/* Financial enquiries are kept visually distinct from contact/survey mail so
   the inbox can triage them separately, and the subject never contains more
   than a name — subject lines leak into notification previews. */
export async function sendFinancialEnquiryEmail(
  input: FinancialEnquiryMailInput,
): Promise<void> {
  const rows: Array<[string, string]> = [
    ["Name", input.name],
    ["Email", input.email],
    ["Phone", input.phone],
  ];

  if (input.kind === "business") {
    if (input.organisation) rows.push(["Organisation", input.organisation]);
    if (input.entityType) rows.push(["Entity type", input.entityType]);
  } else if (input.financialYear) {
    rows.push(["Financial year", input.financialYear]);
  }

  if (input.service) rows.push(["Interested in", input.service]);

  const accent = input.kind === "business" ? "#1d4ed8" : "#0d7a6b";

  await getTransporter().sendMail({
    from: `"Kavi Financial Website" <${env.SMTP_USER}>`,
    to: input.to,
    replyTo: input.email,
    subject: `[Kavi Financial] ${FINANCIAL_LABEL[input.kind]} — ${input.name}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#06060b;color:#e0e0e0;border-radius:12px;">
        <p style="margin:0 0 4px;color:${accent};font-size:12px;font-weight:bold;text-transform:uppercase;letter-spacing:1px;">
          ${FINANCIAL_LABEL[input.kind]}
        </p>
        <h2 style="color:#ffffff;margin:0 0 16px;">New submission from kavisolutions.in/financial</h2>
        <table style="width:100%;border-collapse:collapse;">
          ${rows
            .map(
              ([label, value]) => `<tr>
            <td style="padding:8px 0;color:#a1a1b5;font-weight:bold;width:140px;">${escapeHtml(label)}</td>
            <td style="padding:8px 0;">${escapeHtml(value)}</td>
          </tr>`,
            )
            .join("")}
        </table>
        <div style="margin-top:16px;padding:16px;background:#0b0b14;border-radius:8px;border:1px solid rgba(255,255,255,0.1);">
          <p style="color:#a1a1b5;font-weight:bold;margin:0 0 8px;">Details</p>
          <p style="margin:0;white-space:pre-wrap;">${escapeHtml(input.message)}</p>
        </div>
        <p style="margin-top:16px;color:#6e6e85;font-size:12px;">
          Reply directly to this email to reach the enquirer. Do not request documents
          until scope and engagement terms are agreed in writing.
        </p>
      </div>
    `,
  });
}

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

export type SurveyEnquiryKind = "client" | "surveyor";

export type SurveyEnquiryMailInput = {
  kind: SurveyEnquiryKind;
  name: string;
  email: string;
  phone: string;
  organisation?: string;
  /** Client enquiry: the service the organisation is interested in. */
  service?: string;
  /** Surveyor enquiry: location, languages, experience. */
  location?: string;
  languages?: string;
  experience?: string;
  message: string;
  to: string;
};

const SURVEY_LABEL: Record<SurveyEnquiryKind, string> = {
  client: "Client / project enquiry",
  surveyor: "Surveyor network registration",
};

/* Two visually distinct emails so the inbox can tell a client lead from a
   surveyor application without opening the message. */
export async function sendSurveyEnquiryEmail(input: SurveyEnquiryMailInput): Promise<void> {
  const rows: Array<[string, string]> = [
    ["Name", input.name],
    ["Email", input.email],
    ["Phone", input.phone],
  ];

  if (input.kind === "client") {
    if (input.organisation) rows.push(["Organisation", input.organisation]);
    if (input.service) rows.push(["Service", input.service]);
  } else {
    if (input.location) rows.push(["Location", input.location]);
    if (input.languages) rows.push(["Languages", input.languages]);
    if (input.experience) rows.push(["Experience", input.experience]);
  }

  const accent = input.kind === "client" ? "#0d7a6b" : "#6d28d9";

  await getTransporter().sendMail({
    from: `"Kavi Survey Website" <${env.SMTP_USER}>`,
    to: input.to,
    replyTo: input.email,
    subject: `[Kavi Survey] ${SURVEY_LABEL[input.kind]} — ${input.name}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#06060b;color:#e0e0e0;border-radius:12px;">
        <p style="margin:0 0 4px;color:${accent};font-size:12px;font-weight:bold;text-transform:uppercase;letter-spacing:1px;">
          ${SURVEY_LABEL[input.kind]}
        </p>
        <h2 style="color:#ffffff;margin:0 0 16px;">New submission from kavisolutions.in/survey</h2>
        <table style="width:100%;border-collapse:collapse;">
          ${rows
            .map(
              ([label, value]) => `<tr>
            <td style="padding:8px 0;color:#a1a1b5;font-weight:bold;width:140px;">${escapeHtml(label)}</td>
            <td style="padding:8px 0;">${escapeHtml(value)}</td>
          </tr>`,
            )
            .join("")}
        </table>
        <div style="margin-top:16px;padding:16px;background:#0b0b14;border-radius:8px;border:1px solid rgba(255,255,255,0.1);">
          <p style="color:#a1a1b5;font-weight:bold;margin:0 0 8px;">Details</p>
          <p style="margin:0;white-space:pre-wrap;">${escapeHtml(input.message)}</p>
        </div>
        <p style="margin-top:16px;color:#6e6e85;font-size:12px;">Sent from the Kavi Survey &amp; Research Solutions page</p>
      </div>
    `,
  });
}

export type GovernmentEnquiryMailInput = {
  name: string;
  email: string;
  phone: string;
  organisation: string;
  role?: string;
  portal?: string;
  service?: string;
  message: string;
  to: string;
};

/* Government enquiries are kept separate from commercial contact mail so the
   inbox can route them to the public-sector workstream. The subject carries a
   name only; personal or platform details stay in the body. */
export async function sendGovernmentEnquiryEmail(
  input: GovernmentEnquiryMailInput,
): Promise<void> {
  const rows: Array<[string, string]> = [
    ["Name", input.name],
    ["Email", input.email],
    ["Phone", input.phone],
    ["Department / organisation", input.organisation],
  ];

  if (input.role) rows.push(["Role", input.role]);
  if (input.portal) rows.push(["Platform / portal", input.portal]);
  if (input.service) rows.push(["Interested in", input.service]);

  await getTransporter().sendMail({
    from: `"Kavi Government Website" <${env.SMTP_USER}>`,
    to: input.to,
    replyTo: input.email,
    subject: `[Kavi Government] Modernisation enquiry — ${input.name}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#06060b;color:#e0e0e0;border-radius:12px;">
        <p style="margin:0 0 4px;color:#0284c7;font-size:12px;font-weight:bold;text-transform:uppercase;letter-spacing:1px;">
          Government technology enquiry
        </p>
        <h2 style="color:#ffffff;margin:0 0 16px;">New submission from kavisolutions.in/government</h2>
        <table style="width:100%;border-collapse:collapse;">
          ${rows
            .map(
              ([label, value]) => `<tr>
            <td style="padding:8px 0;color:#a1a1b5;font-weight:bold;width:160px;">${escapeHtml(label)}</td>
            <td style="padding:8px 0;">${escapeHtml(value)}</td>
          </tr>`,
            )
            .join("")}
        </table>
        <div style="margin-top:16px;padding:16px;background:#0b0b14;border-radius:8px;border:1px solid rgba(255,255,255,0.1);">
          <p style="color:#a1a1b5;font-weight:bold;margin:0 0 8px;">Brief</p>
          <p style="margin:0;white-space:pre-wrap;">${escapeHtml(input.message)}</p>
        </div>
        <p style="margin-top:16px;color:#6e6e85;font-size:12px;">
          Do not begin any assessment, scanning or testing until written authorisation is in place.
        </p>
      </div>
    `,
  });
}

export type FarmsEnquiryKind = "product" | "tourism";

export type FarmsEnquiryMailInput = {
  kind: FarmsEnquiryKind;
  name: string;
  email: string;
  phone: string;
  product?: string;
  quantity?: string;
  service?: string;
  travelMonth?: string;
  groupSize?: string;
  message: string;
  to: string;
};

const FARMS_LABEL: Record<FarmsEnquiryKind, string> = {
  product: "Farm product enquiry",
  tourism: "Village tourism enquiry",
};

/* Farms enquiries are split by track in the subject so the team can route a
   product order and a weekend booking separately without opening the mail. */
export async function sendFarmsEnquiryEmail(input: FarmsEnquiryMailInput): Promise<void> {
  const rows: Array<[string, string]> = [
    ["Name", input.name],
    ["Email", input.email],
    ["Phone", input.phone],
  ];

  if (input.kind === "product") {
    if (input.product) rows.push(["Product", input.product]);
    if (input.quantity) rows.push(["Quantity", input.quantity]);
  } else {
    if (input.service) rows.push(["Experience", input.service]);
    if (input.travelMonth) rows.push(["Preferred month", input.travelMonth]);
    if (input.groupSize) rows.push(["Group size", input.groupSize]);
  }

  const accent = input.kind === "product" ? "#15803d" : "#a16207";

  await getTransporter().sendMail({
    from: `"Kavi Farms Website" <${env.SMTP_USER}>`,
    to: input.to,
    replyTo: input.email,
    subject: `[Kavi Farms] ${FARMS_LABEL[input.kind]} — ${input.name}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#06060b;color:#e0e0e0;border-radius:12px;">
        <p style="margin:0 0 4px;color:${accent};font-size:12px;font-weight:bold;text-transform:uppercase;letter-spacing:1px;">
          ${FARMS_LABEL[input.kind]}
        </p>
        <h2 style="color:#ffffff;margin:0 0 16px;">New submission from kavisolutions.in/farms</h2>
        <table style="width:100%;border-collapse:collapse;">
          ${rows
            .map(
              ([label, value]) => `<tr>
            <td style="padding:8px 0;color:#a1a1b5;font-weight:bold;width:150px;">${escapeHtml(label)}</td>
            <td style="padding:8px 0;">${escapeHtml(value)}</td>
          </tr>`,
            )
            .join("")}
        </table>
        <div style="margin-top:16px;padding:16px;background:#0b0b14;border-radius:8px;border:1px solid rgba(255,255,255,0.1);">
          <p style="color:#a1a1b5;font-weight:bold;margin:0 0 8px;">Details</p>
          <p style="margin:0;white-space:pre-wrap;">${escapeHtml(input.message)}</p>
        </div>
        <p style="margin-top:16px;color:#6e6e85;font-size:12px;">
          Confirm current availability and the package contribution before accepting payment.
        </p>
      </div>
    `,
  });
}

export type FellowshipApplicationMailInput = {
  reference: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  candidateStatus: string;
  track: string;
  motivation: string;
  cohort: string;
  to: string;
};

/* Internal notification for a new fellowship application. The public form
   stores first, so a mail failure never loses an application. */
export async function sendFellowshipApplicationEmail(
  input: FellowshipApplicationMailInput,
): Promise<void> {
  const rows: Array<[string, string]> = [
    ["Reference", input.reference],
    ["Name", input.name],
    ["Email", input.email],
    ["Phone", input.phone],
    ["City / district", input.city || "—"],
    ["Current status", input.candidateStatus || "—"],
    ["Track", input.track],
    ["Cohort", input.cohort],
  ];

  await getTransporter().sendMail({
    from: `"Kavi Fellowship" <${env.SMTP_USER}>`,
    to: input.to,
    replyTo: input.email,
    subject: `[Kavi Fellowship] New application — ${input.name} (${input.reference})`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#06060b;color:#e0e0e0;border-radius:12px;">
        <p style="margin:0 0 4px;color:#175cd3;font-size:12px;font-weight:bold;text-transform:uppercase;letter-spacing:1px;">
          Fellowship application
        </p>
        <h2 style="color:#ffffff;margin:0 0 16px;">New application from kavisolutions.in/fellowship</h2>
        <table style="width:100%;border-collapse:collapse;">
          ${rows
            .map(
              ([label, value]) => `<tr>
            <td style="padding:8px 0;color:#a1a1b5;font-weight:bold;width:150px;">${escapeHtml(label)}</td>
            <td style="padding:8px 0;">${escapeHtml(value)}</td>
          </tr>`,
            )
            .join("")}
        </table>
        <div style="margin-top:16px;padding:16px;background:#0b0b14;border-radius:8px;border:1px solid rgba(255,255,255,0.1);">
          <p style="color:#a1a1b5;font-weight:bold;margin:0 0 8px;">Why they want to join</p>
          <p style="margin:0;white-space:pre-wrap;">${escapeHtml(input.motivation)}</p>
        </div>
        <p style="margin-top:16px;color:#6e6e85;font-size:12px;">
          Review and move the application through the pipeline in the admin console.
        </p>
      </div>
    `,
  });
}

export type FellowshipApplicationConfirmationMailInput = {
  reference: string;
  name: string;
  email: string;
  track: string;
  cohort: string;
};

/* Applicant confirmation. It deliberately promises no offer or timeline; the
   reference lets them check the recorded status later. */
export async function sendFellowshipApplicationConfirmationEmail(
  input: FellowshipApplicationConfirmationMailInput,
): Promise<void> {
  await getTransporter().sendMail({
    from: `"Kavi Fellowship" <${env.SMTP_USER}>`,
    to: input.email,
    subject: `Kavi Fellowship application received — ${input.reference}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#06060b;color:#e0e0e0;border-radius:12px;">
        <h2 style="color:#ffffff;margin:0 0 12px;">Application received</h2>
        <p style="margin:0 0 12px;">Hello ${escapeHtml(input.name)},</p>
        <p style="margin:0 0 12px;line-height:1.6;">
          We received your expression of interest for the Kavi Fellowship
          (${escapeHtml(input.track)} track, ${escapeHtml(input.cohort)} cohort).
          This is not an offer. If you are shortlisted, the team will contact you
          for a conversation.
        </p>
        <p style="margin:0 0 8px;color:#a1a1b5;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Your reference</p>
        <p style="margin:0 0 16px;font-family:monospace;font-size:20px;color:#91b4ff;">${escapeHtml(input.reference)}</p>
        <p style="margin:0 0 16px;">
          Check the recorded status at
          <a href="https://kavisolutions.in/fellowship/status" style="color:#22d3ee;">kavisolutions.in/fellowship/status</a>
          using this reference and your email.
        </p>
        <p style="margin:0;color:#6e6e85;font-size:12px;">
          No payment is collected through the website. There is no salary during
          the learning phase and no job guarantee.
        </p>
      </div>
    `,
  });
}

const FELLOWSHIP_STAGE_LABELS: Record<string, string> = {
  applied: "Application received",
  review: "Under review",
  interview: "Interview stage",
  waitlisted: "Waitlisted",
  offer: "Offer shared",
  accepted: "Offer accepted",
  onboarded: "Onboarding complete",
  active: "Fellowship active",
  completed: "Fellowship completed",
  rejected: "Not selected",
  withdrawn: "Withdrawn",
};

export type FellowshipStageUpdateMailInput = {
  reference: string;
  name: string;
  email: string;
  track: string;
  cohort: string;
  stage: string;
  offerExpiresAt?: string | null;
};

/* Stage-change email to the applicant. Internal notes are never included. */
export async function sendFellowshipStageUpdateEmail(
  input: FellowshipStageUpdateMailInput,
): Promise<void> {
  const label = FELLOWSHIP_STAGE_LABELS[input.stage] ?? input.stage;
  const closed = input.stage === "rejected" || input.stage === "withdrawn";
  const offerExpiry =
    input.stage === "offer" && input.offerExpiresAt
      ? new Date(input.offerExpiresAt).toLocaleString("en-IN", {
          dateStyle: "full",
          timeStyle: "short",
          timeZone: "Asia/Kolkata",
        })
      : null;

  await getTransporter().sendMail({
    from: `"Kavi Fellowship" <${env.SMTP_USER}>`,
    to: input.email,
    subject: `Kavi Fellowship status update — ${input.reference}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#06060b;color:#e0e0e0;border-radius:12px;">
        <h2 style="color:#ffffff;margin:0 0 12px;">Application status updated</h2>
        <p style="margin:0 0 12px;">Hello ${escapeHtml(input.name)},</p>
        <p style="margin:0 0 12px;line-height:1.6;">
          Your Kavi Fellowship application (${escapeHtml(input.track)} track,
          ${escapeHtml(input.cohort)} cohort) is now at:
        </p>
        <p style="margin:0 0 16px;font-family:monospace;font-size:18px;color:#91b4ff;">${escapeHtml(label)}</p>
        ${
          offerExpiry
            ? `<p style="margin:0 0 12px;line-height:1.6;"><strong>Please respond by:</strong> ${escapeHtml(offerExpiry)} IST</p>`
            : ""
        }
        <p style="margin:0 0 16px;">
          <a href="https://kavisolutions.in/fellowship/status" style="color:#22d3ee;">Check the status page</a>
          with reference ${escapeHtml(input.reference)} and your email.
        </p>
        <p style="margin:0;color:#6e6e85;font-size:12px;">
          ${
            closed
              ? "This application is closed. Email kavisolutions1@gmail.com if you believe this is a mistake."
              : "This is a status update, not an offer unless the stage says Offer shared."
          }
        </p>
      </div>
    `,
  });
}

export type FellowshipInterviewMailInput = {
  reference: string;
  candidateName: string;
  candidateEmail: string;
  scheduledAt: string;
  mode: string;
  location: string;
  meetingUrl: string;
  interviewers: string[];
  kind: "scheduled" | "updated" | "cancelled";
};

export async function sendFellowshipInterviewCandidateEmail(
  input: FellowshipInterviewMailInput,
): Promise<void> {
  const when = new Date(input.scheduledAt).toLocaleString("en-IN", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  });
  const heading =
    input.kind === "cancelled"
      ? "Interview cancelled"
      : input.kind === "updated"
        ? "Interview rescheduled"
        : "Interview scheduled";

  await getTransporter().sendMail({
    from: `"Kavi Fellowship" <${env.SMTP_USER}>`,
    to: input.candidateEmail,
    subject: `${heading} — Kavi Fellowship (${input.reference})`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#06060b;color:#e0e0e0;border-radius:12px;">
        <h2 style="color:#ffffff;margin:0 0 12px;">${heading}</h2>
        <p style="margin:0 0 12px;">Hello ${escapeHtml(input.candidateName)},</p>
        <p style="margin:0 0 12px;line-height:1.6;">
          ${
            input.kind === "cancelled"
              ? "Your fellowship interview has been cancelled. The team will contact you about the next step."
              : `Your Kavi Fellowship interview is ${input.kind === "updated" ? "now" : ""} scheduled for <strong>${escapeHtml(when)} IST</strong>.`
          }
        </p>
        ${
          input.kind !== "cancelled"
            ? `<p style="margin:0 0 8px;"><strong>Mode:</strong> ${escapeHtml(input.mode)}</p>
               ${
                 input.meetingUrl
                   ? `<p style="margin:0 0 8px;"><strong>Meeting link:</strong> <a href="${escapeHtml(input.meetingUrl)}" style="color:#22d3ee;">${escapeHtml(input.meetingUrl)}</a></p>`
                   : ""
               }
               ${
                 input.location
                   ? `<p style="margin:0 0 8px;"><strong>Location:</strong> ${escapeHtml(input.location)}</p>`
                   : ""
               }
               <p style="margin:0 0 12px;"><strong>Panel:</strong> ${escapeHtml(input.interviewers.join(", "))}</p>`
            : ""
        }
        <p style="margin:0;color:#6e6e85;font-size:12px;">Reference: ${escapeHtml(input.reference)}</p>
      </div>
    `,
  });
}

export type FellowshipInterviewerMailInput = {
  name: string;
  email: string;
  candidateName: string;
  reference: string;
  track: string;
  scheduledAt: string;
  mode: string;
  location: string;
  meetingUrl: string;
  token: string;
};

export async function sendFellowshipInterviewerEmail(
  input: FellowshipInterviewerMailInput,
): Promise<void> {
  const when = new Date(input.scheduledAt).toLocaleString("en-IN", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  });
  const scorecardUrl = `https://kavisolutions.in/mentor/interview/${input.token}`;

  await getTransporter().sendMail({
    from: `"Kavi Fellowship" <${env.SMTP_USER}>`,
    to: input.email,
    subject: `Interview panel — ${input.candidateName} (${input.reference})`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#06060b;color:#e0e0e0;border-radius:12px;">
        <h2 style="color:#ffffff;margin:0 0 12px;">Fellowship interview assignment</h2>
        <p style="margin:0 0 12px;">Hello ${escapeHtml(input.name)},</p>
        <p style="margin:0 0 12px;line-height:1.6;">
          You are on the interview panel for <strong>${escapeHtml(input.candidateName)}</strong>
          (${escapeHtml(input.track)} track, reference ${escapeHtml(input.reference)}).
        </p>
        <p style="margin:0 0 8px;"><strong>When:</strong> ${escapeHtml(when)} IST</p>
        <p style="margin:0 0 8px;"><strong>Mode:</strong> ${escapeHtml(input.mode)}</p>
        ${
          input.meetingUrl
            ? `<p style="margin:0 0 8px;"><strong>Meeting link:</strong> <a href="${escapeHtml(input.meetingUrl)}" style="color:#22d3ee;">${escapeHtml(input.meetingUrl)}</a></p>`
            : ""
        }
        ${
          input.location
            ? `<p style="margin:0 0 8px;"><strong>Location:</strong> ${escapeHtml(input.location)}</p>`
            : ""
        }
        <p style="margin:16px 0;">
          <a href="${scorecardUrl}" style="display:inline-block;padding:12px 18px;background:#175cd3;color:#ffffff;border-radius:8px;text-decoration:none;">
            Open private scorecard
          </a>
        </p>
        <p style="margin:0;color:#6e6e85;font-size:12px;">
          This link is private. Submit the scorecard after the interview. Do not forward it.
        </p>
      </div>
    `,
  });
}
