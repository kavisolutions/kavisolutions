"use client";

import { useState } from "react";

import {
  GOVERNMENT_ROLES,
  GOVERNMENT_SERVICE_OPTIONS,
} from "@/lib/government-data";

const inputClass =
  "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-fog focus:border-sky-400/60";

const labelClass = "mb-1.5 block text-xs font-semibold text-mist";

type Status =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "sent" }
  | { kind: "error"; message: string };

type GovernmentForm = {
  name: string;
  email: string;
  phone: string;
  organisation: string;
  role: string;
  portal: string;
  service: string;
  message: string;
};

const empty: GovernmentForm = {
  name: "",
  email: "",
  phone: "",
  organisation: "",
  role: GOVERNMENT_ROLES[0],
  portal: "",
  service: GOVERNMENT_SERVICE_OPTIONS[0],
  message: "",
};

export default function GovernmentForms() {
  const [form, setForm] = useState<GovernmentForm>(empty);
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const sending = status.kind === "sending";

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (sending) return;
    setStatus({ kind: "sending" });

    try {
      const res = await fetch("/api/government/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        const message = Array.isArray(data?.message) ? data.message.join(" · ") : data?.message;
        setStatus({
          kind: "error",
          message: message || "Could not send your enquiry. Please email us directly.",
        });
        return;
      }

      setStatus({ kind: "sent" });
      setForm(empty);
    } catch {
      setStatus({
        kind: "error",
        message: "Could not reach the server. Check your connection and try again.",
      });
    }
  };

  return (
    <div className="rounded-3xl glass p-6 shadow-lift sm:p-8">
      <h3 className="font-display text-xl font-semibold">Modernisation enquiry</h3>
      <p className="mt-1 text-xs text-mist">
        For departments, institutions and implementation partners. No documents are requested
        through this form.
      </p>

      {status.kind === "sent" && (
        <p className="mt-4 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-xs text-emerald-200">
          Thank you — your enquiry has been sent. We will reply within one working day.
        </p>
      )}
      {status.kind === "error" && (
        <p className="mt-4 rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-xs text-rose-200">
          {status.message}
        </p>
      )}

      <form onSubmit={submit} className="mt-5 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="gov-name">
              Full name *
            </label>
            <input
              id="gov-name"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={inputClass}
              placeholder="Your name"
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="gov-email">
              Official email *
            </label>
            <input
              id="gov-email"
              required
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className={inputClass}
              placeholder="you@department.gov.in"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="gov-phone">
              Phone *
            </label>
            <input
              id="gov-phone"
              required
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className={inputClass}
              placeholder="+91 …"
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="gov-organisation">
              Department / organisation *
            </label>
            <input
              id="gov-organisation"
              required
              value={form.organisation}
              onChange={(e) => setForm({ ...form, organisation: e.target.value })}
              className={inputClass}
              placeholder="Department, university or partner"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="gov-role">
              Your role
            </label>
            <select
              id="gov-role"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className={inputClass}
            >
              {GOVERNMENT_ROLES.map((role) => (
                <option key={role} value={role} className="bg-ink-soft">
                  {role}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass} htmlFor="gov-portal">
              Platform / portal
            </label>
            <input
              id="gov-portal"
              value={form.portal}
              onChange={(e) => setForm({ ...form, portal: e.target.value })}
              className={inputClass}
              placeholder="Name or URL (optional)"
            />
          </div>
        </div>

        <div>
          <label className={labelClass} htmlFor="gov-service">
            What do you need help with?
          </label>
          <select
            id="gov-service"
            value={form.service}
            onChange={(e) => setForm({ ...form, service: e.target.value })}
            className={inputClass}
          >
            {GOVERNMENT_SERVICE_OPTIONS.map((service) => (
              <option key={service} value={service} className="bg-ink-soft">
                {service}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass} htmlFor="gov-message">
            Brief description *
          </label>
          <textarea
            id="gov-message"
            required
            minLength={10}
            maxLength={2000}
            rows={4}
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            className={inputClass}
            placeholder="The service, the problem, and any constraints we should know about."
          />
        </div>

        <button
          type="submit"
          disabled={sending}
          className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-3 text-sm font-semibold text-white shadow-glow transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {sending ? "Sending…" : "Send enquiry"}
        </button>
        <p className="text-[11px] leading-relaxed text-fog">
          By submitting you agree that we may contact you about this enquiry. Please do not send
          citizen data, credentials or confidential documents through this form.
        </p>
      </form>
    </div>
  );
}
