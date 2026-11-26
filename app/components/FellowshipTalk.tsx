"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle2, Loader2, MessageSquareText } from "lucide-react";

import { apiErrorMessage } from "@/lib/api-error";
import { Reveal } from "@/components/motion";
import { useSupportEmail } from "@/lib/support-email";

const CATEGORIES = [
  { value: "admissions", label: "Admissions" },
  { value: "fees", label: "Fees and scholarship" },
  { value: "college", label: "College or institution" },
  { value: "parent", label: "Parent or guardian" },
  { value: "returner", label: "Returning after a job loss" },
  { value: "other", label: "Something else" },
] as const;

export default function FellowshipTalk() {
  const supportEmail = useSupportEmail();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    category: "admissions",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const update = (key: keyof typeof form, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    if (!form.name.trim() || !form.message.trim()) {
      setError("Add your name and a short message.");
      return;
    }
    if (!form.email.trim() && !form.phone.trim()) {
      setError("Add an email address or phone number so the team can reply.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/fellowship-programme/public/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = (await response.json().catch(() => null)) as
        | { ok?: boolean; message?: string }
        | null;
      if (!response.ok) {
        throw new Error(apiErrorMessage(data, "Could not send the message."));
      }
      setSent(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not send the message.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="talk" className="relative scroll-mt-24 px-6 py-20">
      <div className="mx-auto max-w-[1152px]">
        <Reveal className="mb-8 max-w-3xl">
          <div className="mb-3 inline-flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#175CD3]" />
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-[#91B4FF]">
              TALK TO THE TEAM
            </span>
          </div>
          <h2 className="font-display text-3xl font-semibold tracking-tight text-[#F7F9FC] sm:text-4xl">
            Ask about fees, hostels, college sessions or coming back.
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[#A5B3C7]">
            The customer team reads every message. Add a phone number if you want a
            callback. For an application, use the form below instead.
          </p>
        </Reveal>

        <div className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
          <Reveal className="rounded-[24px] border border-[rgba(148,163,184,0.16)] bg-[rgba(18,29,47,0.85)] p-6 backdrop-blur-[16px] sm:p-8">
            <MessageSquareText className="h-6 w-6 text-[#91B4FF]" />
            <h3 className="mt-4 font-display text-xl font-semibold text-[#F7F9FC]">
              What happens next
            </h3>
            <ol className="mt-4 space-y-3 text-sm text-[#A5B3C7]">
              <li className="flex gap-3">
                <span className="font-mono text-xs text-[#91B4FF]">01</span>
                Your message enters the care queue with a category and timestamp.
              </li>
              <li className="flex gap-3">
                <span className="font-mono text-xs text-[#91B4FF]">02</span>
                The team replies by email or calls the number you leave.
              </li>
              <li className="flex gap-3">
                <span className="font-mono text-xs text-[#91B4FF]">03</span>
                Fee, scholarship and hostel answers are confirmed in writing before
                an offer.
              </li>
            </ol>
            <p className="mt-5 border-t border-[rgba(148,163,184,0.12)] pt-4 text-xs leading-relaxed text-[#7889A0]">
              No payment is collected on this website. Do not send bank details or
              documents through this form.
            </p>
          </Reveal>

          <Reveal delay={0.08}>
            {sent ? (
              <div className="flex h-full flex-col justify-center rounded-[24px] border border-emerald-500/30 bg-emerald-500/[0.06] p-8 text-center">
                <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-400" />
                <h3 className="mt-4 font-display text-2xl font-semibold text-[#F7F9FC]">
                  Message received
                </h3>
                <p className="mt-2 text-sm text-[#A5B3C7]">
                  The team will reply using the contact details you shared. If it is
                  urgent, email {supportEmail}.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSent(false);
                    setForm({
                      name: "",
                      email: "",
                      phone: "",
                      category: "admissions",
                      subject: "",
                      message: "",
                    });
                  }}
                  className="mt-5 text-xs font-semibold text-[#91B4FF] underline-offset-4 hover:underline"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form
                onSubmit={submit}
                className="rounded-[24px] border border-[rgba(148,163,184,0.16)] bg-[rgba(18,29,47,0.85)] p-6 backdrop-blur-[16px] sm:p-8"
              >
                {error && (
                  <div className="mb-4 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-200">
                    {error}
                  </div>
                )}
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-medium text-[#A5B3C7]">
                      Full name *
                    </span>
                    <input
                      value={form.name}
                      onChange={(event) => update("name", event.target.value)}
                      placeholder="Your name"
                      className="h-11 w-full rounded-[10px] border border-[rgba(148,163,184,0.2)] bg-[#06060F] px-3 text-sm text-[#F7F9FC] placeholder-[#7889A0] outline-none focus:border-[#91B4FF]"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-medium text-[#A5B3C7]">
                      Phone / WhatsApp
                    </span>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(event) => update("phone", event.target.value)}
                      placeholder="+91"
                      className="h-11 w-full rounded-[10px] border border-[rgba(148,163,184,0.2)] bg-[#06060F] px-3 text-sm text-[#F7F9FC] placeholder-[#7889A0] outline-none focus:border-[#91B4FF]"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-medium text-[#A5B3C7]">
                      Email
                    </span>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(event) => update("email", event.target.value)}
                      placeholder="you@example.com"
                      className="h-11 w-full rounded-[10px] border border-[rgba(148,163,184,0.2)] bg-[#06060F] px-3 text-sm text-[#F7F9FC] placeholder-[#7889A0] outline-none focus:border-[#91B4FF]"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-medium text-[#A5B3C7]">
                      I am asking as
                    </span>
                    <select
                      value={form.category}
                      onChange={(event) => update("category", event.target.value)}
                      className="h-11 w-full rounded-[10px] border border-[rgba(148,163,184,0.2)] bg-[#06060F] px-3 text-sm text-[#F7F9FC] outline-none focus:border-[#91B4FF]"
                    >
                      {CATEGORIES.map((category) => (
                        <option key={category.value} value={category.value}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block sm:col-span-2">
                    <span className="mb-1.5 block text-xs font-medium text-[#A5B3C7]">
                      Subject
                    </span>
                    <input
                      value={form.subject}
                      onChange={(event) => update("subject", event.target.value)}
                      placeholder="Fee, hostel, college session, returning to work…"
                      className="h-11 w-full rounded-[10px] border border-[rgba(148,163,184,0.2)] bg-[#06060F] px-3 text-sm text-[#F7F9FC] placeholder-[#7889A0] outline-none focus:border-[#91B4FF]"
                    />
                  </label>
                  <label className="block sm:col-span-2">
                    <span className="mb-1.5 block text-xs font-medium text-[#A5B3C7]">
                      Message *
                    </span>
                    <textarea
                      value={form.message}
                      onChange={(event) => update("message", event.target.value)}
                      rows={4}
                      placeholder="Tell the team what you need."
                      className="w-full resize-y rounded-[10px] border border-[rgba(148,163,184,0.2)] bg-[#06060F] px-3 py-2.5 text-sm text-[#F7F9FC] placeholder-[#7889A0] outline-none focus:border-[#91B4FF]"
                    />
                  </label>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="mt-5 inline-flex h-11 items-center gap-2 rounded-[10px] bg-[#175CD3] px-5 text-sm font-medium text-white transition-colors hover:bg-[#1849A9] disabled:opacity-60"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                  Send message
                </button>
              </form>
            )}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
