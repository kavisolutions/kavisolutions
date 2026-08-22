import { GlowOrb, Reveal } from "./motion";

const stats = [
  { value: "120+", label: "Projects shipped" },
  { value: "40+", label: "Happy clients" },
  { value: "6+", label: "Years crafting" },
  { value: "99%", label: "On-time delivery" },
];

export default function Hero() {
  return (
    <section
      id="top"
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-32"
    >
      <GlowOrb className="-left-32 top-10 h-96 w-96 bg-violet-600/30" />
      <GlowOrb className="-right-32 bottom-10 h-96 w-96 bg-sky-500/25" />
      <GlowOrb className="left-1/2 top-1/3 h-72 w-72 bg-fuchsia-500/20" />

      <div className="absolute left-1/2 top-24 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-[conic-gradient(from_0deg,rgba(124,58,237,0.35),rgba(14,165,233,0.35),rgba(217,70,239,0.35),rgba(124,58,237,0.35))] blur-3xl animate-spin-slow" />

      <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center text-center">
        <Reveal>
          <span className="mb-6 inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-medium text-mist">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse-ring" />
            Building the digital future, together
          </span>
        </Reveal>

        <Reveal delay={0.1}>
          <h1 className="font-display text-4xl font-bold leading-[1.08] tracking-tight sm:text-6xl lg:text-7xl">
            Ideas become <span className="text-gradient">experiences.</span>
            <br />
            We build the rest.
          </h1>
        </Reveal>

        <Reveal delay={0.2}>
          <p className="mt-6 max-w-2xl text-base text-mist sm:text-lg">
            Kavi Solutions is a full-stack digital studio crafting stunning web
            apps, native mobile apps, product experiences and growth marketing
            — engineered to impress and built to perform.
          </p>
        </Reveal>

        <Reveal delay={0.3}>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <a
              href="#contact"
              className="group rounded-2xl bg-gradient-to-r from-violet-600 to-sky-500 px-7 py-3.5 text-sm font-semibold text-white shadow-glow transition-all hover:scale-105"
            >
              Start your project
              <span className="ml-2 inline-block transition-transform group-hover:translate-x-1">
                →
              </span>
            </a>
            <a
              href="#services"
              className="rounded-2xl glass px-7 py-3.5 text-sm font-semibold text-white transition-all hover:bg-white/10"
            >
              Explore services
            </a>
          </div>
        </Reveal>

        <Reveal delay={0.4} className="mt-16 w-full max-w-3xl">
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-white/10 sm:grid-cols-4">
            {stats.map((s, i) => (
              <div
                key={s.label}
                className={`group flex flex-col items-center gap-1 bg-ink-soft p-6 transition-colors hover:bg-white/5 ${
                  i < 2 ? "" : "after:hidden"
                }`}
              >
                <span className="font-display text-2xl font-bold text-gradient sm:text-3xl transition-transform group-hover:scale-110">
                  {s.value}
                </span>
                <span className="text-xs text-fog">{s.label}</span>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}