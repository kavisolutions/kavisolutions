import { Reveal, RevealItem, RevealStagger } from "./motion";

const services = [
  {
    id: "web",
    icon: "🌐",
    tag: "Web",
    title: "Web Development",
    desc: "Blazing-fast marketing sites and full web applications built with modern frameworks.",
    points: ["Next.js & React", "Headless CMS", "E-commerce", "SEO-first builds"],
    accent: "from-violet-500 to-purple-500",
  },
  {
    id: "mobile",
    icon: "📱",
    tag: "Mobile",
    title: "Mobile Apps",
    desc: "Native-feel iOS & Android apps that users love — smooth, fast and delightful.",
    points: ["React Native & Flutter", "Cross-platform", "App Store launch", "Push & offline"],
    accent: "from-sky-500 to-cyan-500",
  },
  {
    id: "product",
    icon: "🧩",
    tag: "Product",
    title: "Digital Products",
    desc: "From idea to launch — we design, prototype and ship products people adopt.",
    points: ["Product design", "MVP sprints", "Design systems", "UX research"],
    accent: "from-fuchsia-500 to-pink-500",
  },
  {
    id: "marketing",
    icon: "📈",
    tag: "Marketing",
    title: "Digital Marketing",
    desc: "Campaigns that convert. SEO, paid ads and content that grow your audience.",
    points: ["SEO & content", "Paid ads", "Social strategy", "Analytics"],
    accent: "from-emerald-500 to-teal-500",
  },
];

export default function Services() {
  return (
    <section id="services" className="relative px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mx-auto mb-14 max-w-3xl text-center">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-gradient">
            What we do
          </span>
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-5xl">
            Services that <span className="text-gradient">move the needle</span>
          </h2>
        </Reveal>

        <RevealStagger className="grid gap-6 sm:grid-cols-2">
          {services.map((s) => (
            <RevealItem key={s.id}>
              <a
                id={s.id}
                href="#contact"
                className="group card-sheen relative block overflow-hidden rounded-3xl glass p-8 shadow-lift transition-all duration-300 hover:-translate-y-1.5 hover:border-white/20"
              >
                <div
                  className={`absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gradient-to-br ${s.accent} opacity-20 blur-3xl transition-opacity duration-500 group-hover:opacity-40`}
                />
                <div className="relative">
                  <span className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-white/10 to-white/5 text-3xl shadow-lift transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
                    {s.icon}
                  </span>
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-widest text-fog">
                    {s.tag}
                  </span>
                  <h3 className="font-display text-2xl font-semibold tracking-tight">
                    {s.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-mist">
                    {s.desc}
                  </p>
                  <ul className="mt-6 flex flex-wrap gap-2">
                    {s.points.map((p) => (
                      <li
                        key={p}
                        className="rounded-full bg-white/5 px-3 py-1 text-xs text-mist transition-colors group-hover:bg-white/10"
                      >
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              </a>
            </RevealItem>
          ))}
        </RevealStagger>
      </div>
    </section>
  );
}