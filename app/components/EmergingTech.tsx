import Link from "next/link";

import { Reveal, RevealItem, RevealStagger } from "./motion";

const tracks = [
  {
    icon: "🧠",
    tag: "Artificial intelligence",
    title: "AI that earns its place in the product",
    desc: "Assistants grounded in your documents, retrieval that cites its sources, document extraction and vision models — shipped with evaluation and guardrails.",
    points: ["LLM apps & agents", "RAG & private knowledge", "Document intelligence", "Computer vision"],
    href: "/ai-blockchain#features",
    accent: "from-violet-500 to-fuchsia-500",
  },
  {
    icon: "⛓️",
    tag: "Blockchain",
    title: "Trust infrastructure, not hype",
    desc: "Smart contracts, tokenised entitlements and tamper-evident audit trails for workflows where multiple parties need a shared record they can verify.",
    points: ["Smart contracts", "Audit trails", "Tokenisation", "Wallet integration"],
    href: "/ai-blockchain#features",
    accent: "from-cyan-500 to-sky-500",
  },
];

export default function EmergingTech() {
  return (
    <section id="ai-blockchain" className="relative px-6 py-24 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mx-auto mb-14 max-w-3xl text-center">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-gradient">
            Emerging technology
          </span>
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-5xl">
            AI and blockchain, <span className="text-gradient">without the theatre</span>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-mist">
            We build these technologies where they solve a real problem — and tell you when a
            simpler database or a rules engine is the better answer.
          </p>
        </Reveal>

        <RevealStagger className="grid gap-6 lg:grid-cols-2">
          {tracks.map((track) => (
            <RevealItem key={track.tag}>
              <Link
                href={track.href}
                className="group relative block h-full overflow-hidden rounded-3xl glass p-8 shadow-lift transition-all duration-300 hover:-translate-y-1.5 hover:border-white/20"
              >
                <div
                  className={`absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gradient-to-br ${track.accent} opacity-20 blur-3xl transition-opacity duration-500 group-hover:opacity-40`}
                />
                <div className="relative">
                  <span className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 text-3xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
                    {track.icon}
                  </span>
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-widest text-fog">
                    {track.tag}
                  </span>
                  <h3 className="font-display text-2xl font-semibold tracking-tight">
                    {track.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-mist">{track.desc}</p>
                  <ul className="mt-6 flex flex-wrap gap-2">
                    {track.points.map((point) => (
                      <li key={point} className="rounded-full bg-white/5 px-3 py-1 text-xs text-mist">
                        {point}
                      </li>
                    ))}
                  </ul>
                  <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-white">
                    Explore capability
                    <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                  </span>
                </div>
              </Link>
            </RevealItem>
          ))}
        </RevealStagger>
      </div>
    </section>
  );
}
