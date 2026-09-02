"use client";

import { useState } from "react";
import { GlowOrb, Reveal } from "./motion";

export default function Contact() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    service: "Web development",
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
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="relative overflow-hidden px-6 py-24 sm:py-32">
      <GlowOrb className="-left-20 bottom-0 h-80 w-80 bg-sky-500/20" />
      <GlowOrb className="-right-20 top-0 h-80 w-80 bg-violet-600/20" />

      <div className="relative mx-auto grid max-w-5xl gap-10 lg:grid-cols-2">
        <Reveal>
          <div>
            <span className="mb-4 inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-gradient">
              Let&apos;s talk
            </span>
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-5xl">
              Have a project in mind?{" "}
              <span className="text-gradient">Let&apos;s build it.</span>
            </h2>
            <p className="mt-4 max-w-md text-mist sm:text-lg">
              Tell us what you want to create. We&apos;ll reply within
              24 hours with a plan and a quote.
            </p>

            <div className="mt-8 space-y-4">
              <a
                href="mailto:kavisolutions1@gmail.com"
                className="flex items-center gap-3 text-mist transition-colors hover:text-white"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl glass text-lg">
                  ✉️
                </span>
                kavisolutions1@gmail.com
              </a>
              <div className="flex items-center gap-3 text-mist">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl glass text-lg">
                  📍
                </span>
                Worldwide · Remote-first
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <form
            onSubmit={handleSubmit}
            className="card-sheen space-y-4 rounded-3xl glass p-7 shadow-lift"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <input
                required
                placeholder="Your name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition-colors placeholder:text-fog focus:border-violet-400/60"
              />
              <input
                required
                type="email"
                placeholder="Email address"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition-colors placeholder:text-fog focus:border-violet-400/60"
              />
            </div>
            <input
              required
              type="tel"
              placeholder="Phone number"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition-colors placeholder:text-fog focus:border-violet-400/60"
            />
            <select
              value={form.service}
              onChange={(e) => setForm({ ...form, service: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition-colors focus:border-violet-400/60 [&>option]:bg-ink-soft"
            >
              <option>Web development</option>
              <option>Mobile app</option>
              <option>Digital product</option>
              <option>Digital marketing</option>
              <option>Fellowship</option>
              <option>Something else</option>
            </select>
            <textarea
              rows={4}
              required
              placeholder="Tell us about your project..."
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition-colors placeholder:text-fog focus:border-violet-400/60"
            />
            {error && (
              <p className="text-sm text-red-400">{error}</p>
            )}
            <button
              type="submit"
              disabled={sent || loading}
              className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-sky-500 py-3.5 text-sm font-semibold text-white shadow-glow transition-all hover:scale-[1.02] disabled:cursor-default disabled:opacity-80"
            >
              {sent ? "✓ Message sent!" : loading ? "Sending..." : "Send message →"}
            </button>
          </form>
        </Reveal>
      </div>
    </section>
  );
}
