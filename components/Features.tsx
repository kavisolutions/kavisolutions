import { SectionHeading } from "./SectionHeading";
import { RevealItem, RevealStagger } from "./motion";

const features = [
  {
    icon: "⚡",
    title: "Performance first",
    desc: "Lighthouse 90+ scores. Sub-second loads. Your users never wait.",
    accent: "from-violet-500 to-indigo-500",
  },
  {
    icon: "🎨",
    title: "Design that sells",
    desc: "Aesthetic interfaces, motion and polish that make brands unforgettable.",
    accent: "from-sky-500 to-cyan-500",
  },
  {
    icon: "🛡️",
    title: "Secure by default",
    desc: "Hardened auth, encrypted data and battle-tested cloud infrastructure.",
    accent: "from-emerald-500 to-teal-500",
  },
  {
    icon: "🚀",
    title: "Shipped to scale",
    desc: "Deployed on VPS or cloud with CI/CD, monitoring and zero-downtime releases.",
    accent: "from-fuchsia-500 to-pink-500",
  },
];

export default function Features() {
  return (
    <section className="relative px-6 py-24 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          tag="Why Kavi"
          title={
            <>
              Built to impress. <span className="text-gradient">Engineered to last.</span>
            </>
          }
          subtitle="Every project gets obsessive attention to detail — from the first pixel to production deployment."
        />

        <RevealStagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <RevealItem key={f.title}>
              <div className="group relative h-full overflow-hidden rounded-3xl glass p-6 shadow-lift transition-all duration-300 hover:-translate-y-2 hover:shadow-glow">
                <div
                  className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${f.accent} opacity-70`}
                />
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
  );
}