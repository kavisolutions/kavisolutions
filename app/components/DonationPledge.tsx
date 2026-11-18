"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  HandCoins,
  HeartHandshake,
  Loader2,
  ShieldCheck,
} from "lucide-react";

const PURPOSES = [
  { value: "general", label: "Where it is needed most" },
  { value: "scholarship", label: "Scholarship for a candidate" },
  { value: "equipment", label: "Laptop, data or equipment" },
  { value: "travel", label: "Travel and field work" },
  { value: "stipend", label: "Stipend bridge fund" },
] as const;

const RECOGNITION = [
  { value: "none", label: "No public recognition" },
  { value: "annual_report", label: "Name in the annual report" },
  { value: "wall", label: "Name on the learning-centre wall" },
  { value: "event", label: "Invitation to demo day" },
  { value: "mentor", label: "Mentor or guest-session invitation" },
] as const;

export default function DonationPledge() {
  const [form, setForm] = useState({
    donorName: "",
    email: "",
    phone: "",
    amount: "",
    purpose: "scholarship",
    rewardPreference: "none",
    anonymous: false,
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const update = (key: keyof typeof form, value: string | boolean) =>
    setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    if (!form.donorName.trim()) {
      setError("Add your name.");
      return;
    }
    if (Number(form.amount) <= 0) {
      setError("Enter a pledge amount.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/fellowship-programme/public/donation-pledges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, amount: Number(form.amount) }),
      });
      const data = (await response.json().catch(() => null)) as
        | { ok?: boolean; message?: string }
        | null;
      if (!response.ok) {
        throw new Error(data?.message || "Could not record the pledge.");
      }
      setSent(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not record the pledge.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink text-[#F7F9FC]">
      <section className="relative overflow-hidden px-6 pb-14 pt-28">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_0%,rgba(16,185,129,0.18),transparent_40%),radial-gradient(circle_at_90%_20%,rgba(23,92,211,0.18),transparent_45%)]" />
        <div className="relative mx-auto max-w-[1050px]">
          <Link
            href="/fellowship"
            className="inline-flex items-center gap-1.5 text-xs text-[#A5B3C7] hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Fellowship
          </Link>
          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/[0.06] px-3 py-1.5">
            <HeartHandshake className="h-3.5 w-3.5 text-[#34D399]" />
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[#A5B3C7]">
              Support the fellowship
            </span>
          </div>
          <h1 className="mt-5 max-w-3xl font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            Fund a seat. Not a promise.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-[#A5B3C7]">
            Donations and grants can cover a candidate&apos;s training contribution,
            a laptop, data, travel or a stipend bridge. We confirm the amount, use
            and recognition in writing before accepting money.
          </p>
        </div>
      </section>

      <section className="px-6 py-12">
        <div className="mx-auto grid max-w-[1050px] gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-3">
            {[
              ["Scholarship", "Reduce or remove the training contribution for a candidate who cannot pay."],
              ["Equipment", "A working laptop, internet data or a phone for field work."],
              ["Travel", "Bus, train and stay for DSN field work and residencies."],
              ["Stipend bridge", "Support the month-6 stipend before client work covers it."],
            ].map(([title, detail]) => (
              <div
                key={title}
                className="rounded-[18px] border border-[rgba(148,163,184,0.16)] bg-[rgba(18,29,47,0.8)] p-5"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#34D399]" />
                  <h2 className="font-display text-base font-semibold">{title}</h2>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-[#A5B3C7]">{detail}</p>
              </div>
            ))}
            <div className="rounded-[18px] border border-amber-500/20 bg-amber-500/[0.05] p-5">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-amber-300" />
                <h2 className="font-display text-base font-semibold">Before you pay</h2>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-[#A5B3C7]">
                This page records a pledge, not a payment. The team will confirm the
                bank details, receipt and recognition in writing. No tax-exemption
                claim is made until the legal registration is in place.
              </p>
            </div>
          </div>

          <div>
            {sent ? (
              <div className="rounded-[24px] border border-emerald-500/30 bg-emerald-500/[0.06] p-10 text-center">
                <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-400" />
                <h2 className="mt-4 font-display text-2xl font-semibold">Pledge recorded</h2>
                <p className="mt-2 text-sm text-[#A5B3C7]">
                  The team will contact you to confirm the amount, purpose and
                  recognition before any money is accepted.
                </p>
                <button
                  type="button"
                  onClick={() => setSent(false)}
                  className="mt-5 text-xs font-semibold text-[#91B4FF] underline-offset-4 hover:underline"
                >
                  Record another pledge
                </button>
              </div>
            ) : (
              <form
                onSubmit={submit}
                className="rounded-[24px] border border-[rgba(148,163,184,0.16)] bg-[rgba(18,29,47,0.85)] p-6 sm:p-8"
              >
                {error && (
                  <div className="mb-4 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-200">
                    {error}
                  </div>
                )}
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-medium text-[#A5B3C7]">Your name *</span>
                    <input
                      value={form.donorName}
                      onChange={(event) => update("donorName", event.target.value)}
                      className="h-11 w-full rounded-[10px] border border-[rgba(148,163,184,0.2)] bg-[#06060F] px-3 text-sm text-[#F7F9FC] placeholder-[#7889A0] outline-none focus:border-[#91B4FF]"
                      placeholder="Name or organisation"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-medium text-[#A5B3C7]">Pledge amount (₹) *</span>
                    <input
                      type="number"
                      min={1}
                      value={form.amount}
                      onChange={(event) => update("amount", event.target.value)}
                      className="h-11 w-full rounded-[10px] border border-[rgba(148,163,184,0.2)] bg-[#06060F] px-3 text-sm text-[#F7F9FC] placeholder-[#7889A0] outline-none focus:border-[#91B4FF]"
                      placeholder="5000"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-medium text-[#A5B3C7]">Email</span>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(event) => update("email", event.target.value)}
                      className="h-11 w-full rounded-[10px] border border-[rgba(148,163,184,0.2)] bg-[#06060F] px-3 text-sm text-[#F7F9FC] placeholder-[#7889A0] outline-none focus:border-[#91B4FF]"
                      placeholder="you@example.com"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-medium text-[#A5B3C7]">Phone</span>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(event) => update("phone", event.target.value)}
                      className="h-11 w-full rounded-[10px] border border-[rgba(148,163,184,0.2)] bg-[#06060F] px-3 text-sm text-[#F7F9FC] placeholder-[#7889A0] outline-none focus:border-[#91B4FF]"
                      placeholder="+91"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-medium text-[#A5B3C7]">Use</span>
                    <select
                      value={form.purpose}
                      onChange={(event) => update("purpose", event.target.value)}
                      className="h-11 w-full rounded-[10px] border border-[rgba(148,163,184,0.2)] bg-[#06060F] px-3 text-sm text-[#F7F9FC] outline-none focus:border-[#91B4FF]"
                    >
                      {PURPOSES.map((purpose) => (
                        <option key={purpose.value} value={purpose.value}>
                          {purpose.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-medium text-[#A5B3C7]">Recognition</span>
                    <select
                      value={form.rewardPreference}
                      onChange={(event) => update("rewardPreference", event.target.value)}
                      className="h-11 w-full rounded-[10px] border border-[rgba(148,163,184,0.2)] bg-[#06060F] px-3 text-sm text-[#F7F9FC] outline-none focus:border-[#91B4FF]"
                    >
                      {RECOGNITION.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-[#A5B3C7] sm:col-span-2">
                    <input
                      type="checkbox"
                      checked={form.anonymous}
                      onChange={(event) => update("anonymous", event.target.checked)}
                      className="h-4 w-4 rounded border-[rgba(148,163,184,0.3)] bg-[#06060F]"
                    />
                    Keep my donation anonymous in public material.
                  </label>
                  <label className="block sm:col-span-2">
                    <span className="mb-1.5 block text-xs font-medium text-[#A5B3C7]">Note</span>
                    <textarea
                      value={form.notes}
                      onChange={(event) => update("notes", event.target.value)}
                      rows={3}
                      className="w-full resize-y rounded-[10px] border border-[rgba(148,163,184,0.2)] bg-[#06060F] px-3 py-2.5 text-sm text-[#F7F9FC] placeholder-[#7889A0] outline-none focus:border-[#91B4FF]"
                      placeholder="Anything the team should know."
                    />
                  </label>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="mt-5 inline-flex h-11 items-center gap-2 rounded-[10px] bg-[#175CD3] px-5 text-sm font-medium text-white transition-colors hover:bg-[#1849A9] disabled:opacity-60"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <HandCoins className="h-4 w-4" />}
                  Record pledge
                </button>
                <p className="mt-3 text-[11px] text-[#7889A0]">
                  No payment is collected on this page. Do not send bank details here.
                </p>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
