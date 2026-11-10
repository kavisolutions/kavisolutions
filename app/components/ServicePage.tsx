import Link from "next/link";
import type { ServiceData } from "@/lib/services-data";
import { GlowOrb, Reveal, RevealItem, RevealStagger } from "@/components/motion";

export function ServicePage({ data }: { data: ServiceData }) {
  return (
    <div className="relative min-h-screen bg-ink font-sans text-white">
      {/* HERO */}
      <section className="relative overflow-hidden px-6 pt-40 pb-20">
        <GlowOrb className={`-left-24 top-10 h-80 w-80 bg-gradient-to-br ${data.gradient} opacity-30 blur-3xl`} />
        <GlowOrb className="-right-24 bottom-10 h-80 w-80 bg-gradient-to-br ${data.gradient} opacity-20 blur-3xl" />

        <div className="relative mx-auto max-w-4xl text-center">
          <Reveal>
            <span className={`mb-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r ${data.gradient} bg-opacity-10 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-gradient ring-1 ring-white/10`}>
              {data.icon} {data.tag}
            </span>
          </Reveal>
          <Reveal delay={0.1}>
            <h1 className="font-display text-4xl font-bold leading-[1.1] tracking-tight sm:text-6xl">
              {data.title}{" "}
              <span className="text-gradient">{data.highlight}</span>
            </h1>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mx-auto mt-6 max-w-2xl text-base text-mist sm:text-lg">
              {data.hero}
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
              <a
                href="#contact"
                className={`rounded-2xl bg-gradient-to-r ${data.gradient} px-7 py-3.5 text-sm font-semibold text-white shadow-glow transition-all hover:scale-105`}
              >
                Start your project →
              </a>
              <a
                href="#features"
                className="rounded-2xl glass px-7 py-3.5 text-sm font-semibold text-white transition-all hover:bg-white/10"
              >
                Explore features
              </a>
            </div>
          </Reveal>

          <Reveal delay={0.4} className="mt-14 w-full max-w-3xl">
            <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-white/10 sm:grid-cols-4">
              {data.metrics.map((m) => (
                <div
                  key={m.label}
                  className="group flex flex-col items-center gap-1 bg-ink-soft p-6 transition-colors hover:bg-white/5"
                >
                  <span className={`font-display text-2xl font-bold text-gradient transition-transform group-hover:scale-110 sm:text-3xl`}>
                    {m.value}
                  </span>
                  <span className="text-xs text-fog">{m.label}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="relative px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <Reveal className="mx-auto mb-14 max-w-3xl text-center">
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-5xl">
              {data.featuresTitle}
            </h2>
          </Reveal>
          <RevealStagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {data.features.map((f) => (
              <RevealItem key={f.title}>
                <div className="group relative h-full overflow-hidden rounded-3xl glass p-6 shadow-lift transition-all duration-300 hover:-translate-y-2 hover:shadow-glow">
                  <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 text-2xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">
                    {f.icon}
                  </span>
                  <h3 className="font-display text-lg font-semibold">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-mist">{f.desc}</p>
                </div>
              </RevealItem>
            ))}
          </RevealStagger>
        </div>
      </section>

      {/* PROCESS */}
      <section className="relative px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <Reveal className="mx-auto mb-14 max-w-3xl text-center">
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-5xl">
              {data.processTitle}
            </h2>
          </Reveal>
          <RevealStagger className="space-y-4">
            {data.process.map((p) => (
              <RevealItem key={p.step}>
                <div className="group flex items-start gap-5 rounded-2xl glass p-6 shadow-lift transition-all duration-300 hover:border-white/20 hover:bg-white/5">
                  <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${data.gradient} font-display text-lg font-bold text-white`}>
                    {p.step}
                  </span>
                  <div>
                    <h3 className="font-display text-lg font-semibold">{p.title}</h3>
                    <p className="mt-1 text-sm text-mist">{p.desc}</p>
                  </div>
                </div>
              </RevealItem>
            ))}
          </RevealStagger>
        </div>
      </section>

      {/* STACK */}
      <section className="relative px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <Reveal className="mx-auto mb-10 max-w-3xl text-center">
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-5xl">
              {data.stackTitle}
            </h2>
          </Reveal>
          <Reveal className="flex flex-wrap items-center justify-center gap-3">
            {data.stack.map((t) => (
              <span
                key={t}
                className="rounded-full glass px-4 py-2 text-sm text-mist transition-colors hover:bg-white/10 hover:text-white"
              >
                {t}
              </span>
            ))}
          </Reveal>
        </div>
      </section>

      {/* FAQ */}
      <section className="relative px-6 py-24">
        <div className="mx-auto max-w-3xl">
          <Reveal className="mx-auto mb-10 text-center">
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              {data.faqTitle}
            </h2>
          </Reveal>
          <RevealStagger className="space-y-4">
            {data.faq.map((f) => (
              <RevealItem key={f.q}>
                <details className="group rounded-2xl glass p-6 shadow-lift transition-colors hover:border-white/20">
                  <summary className="flex cursor-pointer list-none items-center justify-between font-display text-base font-semibold">
                    {f.q}
                    <span className="ml-4 text-mist transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-mist">{f.a}</p>
                </details>
              </RevealItem>
            ))}
          </RevealStagger>
        </div>
      </section>

      {/* CTA */}
      <section id="contact" className="relative overflow-hidden px-6 pb-28 pt-6">
        <div className="mx-auto max-w-4xl">
          <Reveal>
            <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${data.gradient} p-10 text-center text-white shadow-glow`}>
              <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
              <div className="absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
              <div className="relative">
                <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
                  {data.ctaTitle}
                </h2>
                <p className="mx-auto mt-3 max-w-xl text-sm text-white/90 sm:text-base">
                  {data.ctaDesc}
                </p>
                <Link
                  href="/#contact"
                  className="mt-7 inline-block rounded-2xl bg-white px-7 py-3.5 text-sm font-semibold text-gray-900 shadow-lift transition-all hover:scale-105"
                >
                  Get in touch →
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}