"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle2, Globe, Mail, Send } from "lucide-react";
import { GlowOrb, Reveal, TiltCard } from "./motion";

export default function Contact() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    service: "Full-Stack Web Application",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Failed to send");

      setSent(true);
      setForm({
        name: "",
        email: "",
        phone: "",
        service: "Full-Stack Web Application",
        message: "",
      });
    } catch {
      setError("Something went wrong. Please try again or email us directly.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="relative px-6 py-24 sm:py-32 overflow-hidden">
      {/* Ambient Light Highlights */}
      <GlowOrb className="bottom-10 left-10 w-[500px] h-[320px] bg-[#3B82F6]/15 blur-[120px]" />
      <GlowOrb className="top-10 right-10 w-[400px] h-[300px] bg-[#8B5CF6]/15 blur-[120px]" />

      <div className="relative mx-auto max-w-[1152px]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Context & Direct Contact */}
          <Reveal className="lg:col-span-5 flex flex-col">
            <div className="inline-flex items-center gap-2 mb-4">
              <span className="h-2 w-2 rounded-full bg-[#175CD3]" />
              <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-[#7889A0]">
                PROJECT ENGAGEMENT
              </span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-[#F7F9FC] mb-6 leading-tight">
              Have a project in mind? Let&apos;s build it.
            </h2>
            <p className="text-base leading-relaxed text-[#A5B3C7] mb-8">
              Share your specifications, roadmap timeline, or rough thesis. A partner will review
              your requirements and respond within 24 hours with an architectural breakdown and
              commercial quote.
            </p>

            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[#19202E]/60 border border-[rgba(148,163,184,0.14)]">
                <div className="w-10 h-10 rounded-lg bg-[#19202E] flex items-center justify-center shrink-0 text-[#91B4FF]">
                  <Mail className="h-5 w-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] uppercase tracking-wider text-[#7889A0] font-semibold font-mono">
                    Direct Partner Inbox
                  </span>
                  <a
                    href="mailto:kavisolutions1@gmail.com"
                    className="text-[14px] sm:text-[15px] text-[#91B4FF] hover:underline font-medium"
                  >
                    kavisolutions1@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[#19202E]/60 border border-[rgba(148,163,184,0.14)]">
                <div className="w-10 h-10 rounded-lg bg-[#19202E] flex items-center justify-center shrink-0 text-[#45dfa4]">
                  <Globe className="h-5 w-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] uppercase tracking-wider text-[#7889A0] font-semibold font-mono">
                    Operating Footprint
                  </span>
                  <span className="text-[14px] sm:text-[15px] text-[#F7F9FC] font-medium">
                    Worldwide · Remote-first Studio
                  </span>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Right Column: Glass Executive Terminal Form Card with 3D Tilt */}
          <Reveal delay={0.15} className="lg:col-span-7">
            <TiltCard
              intensity={6}
              className="rounded-[24px] bg-[rgba(18,29,47,0.88)] backdrop-blur-[20px] border border-[rgba(148,163,184,0.18)] p-8 sm:p-10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.6)] relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#2563EB] via-[#06B6D4] to-[#45dfa4]" />

              {sent ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-[#34D399]/15 border border-[#34D399]/30 flex items-center justify-center text-[#34D399] mb-4">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <h3 className="font-display text-2xl font-semibold text-[#F7F9FC] mb-2">
                    Brief received
                  </h3>
                  <p className="text-sm text-[#A5B3C7] max-w-sm mb-6">
                    Thank you. A senior partner will review your requirements and respond within 24 hours.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSent(false)}
                    className="text-xs font-mono text-[#91B4FF] hover:underline"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                  {error && (
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-300">
                      {error}
                    </div>
                  )}

                  {/* Name Input */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-medium text-[#A5B3C7]" htmlFor="name">
                      Your Name or Organisation
                    </label>
                    <input
                      id="name"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="e.g. Vikram Sharma, Acme Labs"
                      className="h-12 px-4 rounded-[12px] bg-[#06060F] border border-[rgba(148,163,184,0.20)] text-[#F7F9FC] placeholder-[#7889A0] text-[14px] focus:outline-none focus:border-[#91B4FF] transition-colors"
                    />
                  </div>

                  {/* Grid: Email + Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-medium text-[#A5B3C7]" htmlFor="email">
                        Work Email
                      </label>
                      <input
                        id="email"
                        required
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="name@company.com"
                        className="h-12 px-4 rounded-[12px] bg-[#06060F] border border-[rgba(148,163,184,0.20)] text-[#F7F9FC] placeholder-[#7889A0] text-[14px] focus:outline-none focus:border-[#91B4FF] transition-colors"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-medium text-[#A5B3C7]" htmlFor="phone">
                        Phone or WhatsApp
                      </label>
                      <input
                        id="phone"
                        type="tel"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        placeholder="+91 98765 43210"
                        className="h-12 px-4 rounded-[12px] bg-[#06060F] border border-[rgba(148,163,184,0.20)] text-[#F7F9FC] placeholder-[#7889A0] text-[14px] focus:outline-none focus:border-[#91B4FF] transition-colors"
                      />
                    </div>
                  </div>

                  {/* Discipline Dropdown */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-medium text-[#A5B3C7]" htmlFor="service">
                      Primary Discipline
                    </label>
                    <select
                      id="service"
                      value={form.service}
                      onChange={(e) => setForm({ ...form, service: e.target.value })}
                      className="h-12 px-4 rounded-[12px] bg-[#06060F] border border-[rgba(148,163,184,0.20)] text-[#F7F9FC] text-[14px] focus:outline-none focus:border-[#91B4FF] transition-colors"
                    >
                      <option value="Full-Stack Web Application" className="bg-[#0B1220]">
                        Full-Stack Web Application
                      </option>
                      <option value="iOS / Android Native Mobile Product" className="bg-[#0B1220]">
                        iOS / Android Native Mobile Product
                      </option>
                      <option value="Applied AI & LLM Automation" className="bg-[#0B1220]">
                        Applied AI &amp; LLM Automation
                      </option>
                      <option value="Growth Marketing & SEO Engine" className="bg-[#0B1220]">
                        Growth Marketing &amp; SEO Engine
                      </option>
                      <option value="Blockchain / Cryptographic System" className="bg-[#0B1220]">
                        Blockchain / Cryptographic System
                      </option>
                      <option value="Kavi Fellowship Residency Query" className="bg-[#0B1220]">
                        Kavi Fellowship Residency Query
                      </option>
                    </select>
                  </div>

                  {/* Message Input */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-medium text-[#A5B3C7]" htmlFor="message">
                      Project Scope &amp; Timeline
                    </label>
                    <textarea
                      id="message"
                      required
                      rows={4}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder="Tell us about your target users, key milestones, existing stack, and budget envelope..."
                      className="p-4 rounded-[12px] bg-[#06060F] border border-[rgba(148,163,184,0.20)] text-[#F7F9FC] placeholder-[#7889A0] text-[14px] focus:outline-none focus:border-[#91B4FF] transition-colors resize-none"
                    />
                  </div>

                  {/* Form Submit CTA */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 h-12 rounded-[12px] bg-[#175CD3] hover:bg-[#1849A9] text-[#FFFFFF] text-[15px] font-medium flex items-center justify-center gap-2 transition-all shadow-[0_0_24px_rgba(23,92,211,0.4)] focus:outline-none focus:ring-2 focus:ring-[#91B4FF] group disabled:opacity-50"
                  >
                    <span>{loading ? "Transmitting brief..." : "Send project brief"}</span>
                    <Send className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </form>
              )}
            </TiltCard>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
