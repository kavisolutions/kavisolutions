import { SectionHeading } from "./SectionHeading";
import { Reveal, RevealItem, RevealStagger } from "./motion";

const tracks = [
  {
    icon: "🎓",
    title: "Mentorship",
    desc: "One-on-one guidance from senior engineers and designers building real products.",
  },
  {
    icon: "🧑‍💻",
    title: "Build in public",
    desc: "Ship a portfolio-worthy project with a team, reviewed weekly by experts.",
  },
  {
    icon: "🤝",
    title: "Network",
    desc: "Join a tight community of builders, founders and recruiters.",
  },
  {
    icon: "🎁",
    title: "Opportunities",
    desc: "Top fellows get referrals, internships and early access to Kavi projects.",
  },
];

const cohort = ["Winter 2026", "Spring 2026", "Summer 2026"];

export default function Fellowship() {
  return (
    <section id="fellowship" className="relative overflow-hidden px-6 py-24 sm:py-32">
      <div className="absolute left-1/2 top-1/2 h-[30rem] w-[30rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/10 blur-3xl" />

      <div className="relative mx-auto max-w-6xl">
        <SectionHeading
          tag="Fellowship"
          title={
            <>
              Launch your career with{" "}
              <span className="text-gradient">Kavi Fellows</span>
            </>
          }
          subtitle="A 12-week immersive program where students and early-career devs build real products, learn from pros and get hired."
        />

        <Reveal className="mx-auto mb-14 max-w-3xl">
          <div className="flex flex-wrap items-center justify-center gap-3 rounded-3xl glass p-6 shadow-lift">
            <span className="text-sm font-semibold text-mist">
              Next cohorts →
            </span>
            {cohort.map((c) => (
              <span
                key={c}
                className="rounded-full bg-gradient-to-r from-violet-600/20 to-sky-500/20 px-4 py-1.5 text-sm font-medium text-white ring-1 ring-violet-400/30"
              >
                {c}
              </span>
            ))}
          </div>
        </Reveal>

        <RevealStagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {tracks.map((t) => (
            <RevealItem key={t.title}>
              <div className="group relative h-full overflow-hidden rounded-3xl glass p-6 shadow-lift transition-all duration-300 hover:-translate-y-2 hover:shadow-glow">
                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-violet-500/10 blur-2xl transition-all duration-500 group-hover:bg-violet-500/25" />
                <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/30 to-sky-500/30 text-2xl ring-1 ring-white/10 transition-transform duration-300 group-hover:scale-110">
                  {t.icon}
                </span>
                <h3 className="font-display text-lg font-semibold">{t.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-mist">{t.desc}</p>
              </div>
            </RevealItem>
          ))}
        </RevealStagger>

        <Reveal className="mt-12 text-center">
          <a
            href="#contact"
            className="group inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-sky-500 px-7 py-3.5 text-sm font-semibold text-white shadow-glow transition-all hover:scale-105"
          >
            Apply for the fellowship
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </a>
        </Reveal>
      </div>
    </section>
  );
}