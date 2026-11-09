import { Reveal } from "./motion";

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
      <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center text-center">
        <Reveal>
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/5 px-4 py-1.5 text-xs font-medium tracking-wide text-blue-200">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
            Digital product studio · India &amp; beyond
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
              className="group rounded-md bg-[#175cd3] px-7 py-3.5 text-sm font-semibold text-white shadow-glow transition-colors hover:bg-[#1849a9]"
            >
              Start your project
              <span className="ml-2 inline-block transition-transform group-hover:translate-x-1">
                →
              </span>
            </a>
            <a
              href="#services"
              className="rounded-md border border-white/15 bg-white/[0.03] px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/[0.07]"
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
