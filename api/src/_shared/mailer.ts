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

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
