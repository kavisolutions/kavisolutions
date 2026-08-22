"use client";

import { useState } from "react";
import { GlowOrb, Reveal } from "./motion";

export default function Contact() {
  const [sent, setSent] = useState(false);

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
                href="mailto:hello@kavisolutions.com"
                className="flex items-center gap-3 text-mist transition-colors hover:text-white"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl glass text-lg">
                  ✉️
                </span>
                hello@kavisolutions.com
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
            onSubmit={(e) => {
              e.preventDefault();
              setSent(true);
            }}
            className="card-sheen space-y-4 rounded-3xl glass p-7 shadow-lift"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <input
                required
                placeholder="Your name"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition-colors placeholder:text-fog focus:border-violet-400/60"
              />
              <input
                required
                type="email"
                placeholder="Email address"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition-colors placeholder:text-fog focus:border-violet-400/60"
              />
            </div>
            <select className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition-colors focus:border-violet-400/60 [&>option]:bg-ink-soft">
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
              className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition-colors placeholder:text-fog focus:border-violet-400/60"
            />
            <button
              type="submit"
              disabled={sent}
              className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-sky-500 py-3.5 text-sm font-semibold text-white shadow-glow transition-all hover:scale-[1.02] disabled:cursor-default disabled:opacity-80"
            >
              {sent ? "✓ Message sent!" : "Send message →"}
            </button>
          </form>
        </Reveal>
      </div>
    </section>
  );
}