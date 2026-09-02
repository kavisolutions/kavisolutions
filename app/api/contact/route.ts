import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, service, message } = await req.json();

    if (!name || !email || !phone || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Kavi Solutions Website" <${process.env.SMTP_USER}>`,
      to: process.env.CONTACT_EMAIL || process.env.SMTP_USER,
      replyTo: email,
      subject: `New Contact Form — ${service || "General Inquiry"}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#06060b;color:#e0e0e0;border-radius:12px;">
          <h2 style="color:#a78bfa;">New message from kavisolutions.in</h2>
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:8px 0;color:#a1a1b5;font-weight:bold;">Name</td><td style="padding:8px 0;">${name}</td></tr>
            <tr><td style="padding:8px 0;color:#a1a1b5;font-weight:bold;">Email</td><td style="padding:8px 0;"><a href="mailto:${email}" style="color:#22d3ee;">${email}</a></td></tr>
            <tr><td style="padding:8px 0;color:#a1a1b5;font-weight:bold;">Phone</td><td style="padding:8px 0;"><a href="tel:${phone}" style="color:#22d3ee;">${phone}</a></td></tr>
            <tr><td style="padding:8px 0;color:#a1a1b5;font-weight:bold;">Service</td><td style="padding:8px 0;">${service || "Not specified"}</td></tr>
          </table>
          <div style="margin-top:16px;padding:16px;background:#0b0b14;border-radius:8px;border:1px solid rgba(255,255,255,0.1);">
            <p style="color:#a1a1b5;font-weight:bold;margin:0 0 8px;">Message</p>
            <p style="margin:0;white-space:pre-wrap;">${message}</p>
          </div>
          <p style="margin-top:16px;color:#6e6e85;font-size:12px;">Sent from kavisolutions.in contact form</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
