import { Handshake, Users } from "lucide-react";
import { FELLOWSHIP_MENTORS } from "@/lib/fellowship-data";
import { Reveal, RevealItem, RevealStagger } from "@/components/motion";

const PARTNER_GROUPS = [
  {
    title: "Kavi project mentors",
    detail: "Engineers, designers, researchers and operators who review live work.",
  },
  {
    title: "DSN community partners",
    detail: "Schools, colleges, farmers, self-help groups and local organisations.",
  },
  {
    title: "Live project teams",
    detail: "Kavi verticals and client teams that host real briefs and deliverables.",
  },
  {
    title: "Verification system",
    detail: "Certificates are checked through the public /verify/<id> page.",
  },
] as const;

export default function FellowshipPeople() {
  return (
    <section id="people" className="relative px-6 py-20">
      <div className="mx-auto max-w-[1152px]">
        <Reveal className="mx-auto mb-10 max-w-3xl text-center">
          <div className="mb-3 inline-flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#175CD3]" />
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-[#91B4FF]">
              MENTORS AND PARTNERS
            </span>
          </div>
          <h2 className="font-display text-3xl font-semibold tracking-tight text-[#F7F9FC] sm:text-4xl lg:text-5xl">
            The people behind the year
          </h2>
          <p className="mt-4 text-base leading-relaxed text-[#A5B3C7]">
            Fellows are not left alone with a curriculum. They work with named
            mentors, community partners and live project teams.
          </p>
        </Reveal>

        <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
          <RevealStagger className="grid gap-3">
            {FELLOWSHIP_MENTORS.map((mentor) => (
              <RevealItem key={mentor.name}>
                <div className="flex gap-4 rounded-[18px] border border-[rgba(148,163,184,0.16)] bg-[rgba(18,29,47,0.85)] p-5 backdrop-blur-[16px]">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[rgba(148,163,184,0.16)] bg-[#19202E] text-[#91B4FF]">
                    <Users className="h-4 w-4" />
                  </span>
                  <div>
                    <h3 className="font-display text-base font-semibold text-[#F7F9FC]">
                      {mentor.name}
                    </h3>
                    <p className="mt-0.5 font-mono text-[9px] uppercase tracking-wider text-[#7889A0]">
                      {mentor.role}
                    </p>
                    <p className="mt-2 text-xs leading-relaxed text-[#A5B3C7]">
                      {mentor.focus}
                    </p>
                  </div>
                </div>
              </RevealItem>
            ))}
          </RevealStagger>

          <Reveal delay={0.1}>
            <div className="h-full rounded-[24px] border border-[rgba(148,163,184,0.16)] bg-[rgba(18,29,47,0.85)] p-6 backdrop-blur-[16px] sm:p-7">
              <div className="flex items-center gap-2">
                <Handshake className="h-4 w-4 text-[#34D399]" />
                <h3 className="font-display text-lg font-semibold text-[#F7F9FC]">
                  Where the work happens
                </h3>
              </div>
              <div className="mt-4 grid gap-3">
                {PARTNER_GROUPS.map((group) => (
                  <div
                    key={group.title}
                    className="rounded-xl border border-[rgba(148,163,184,0.14)] bg-[rgba(18,29,47,0.55)] p-3.5"
                  >
                    <h4 className="text-xs font-medium text-[#F7F9FC]">
                      {group.title}
                    </h4>
                    <p className="mt-1 text-[11px] leading-relaxed text-[#A5B3C7]">
                      {group.detail}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
