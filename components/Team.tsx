"use client";

import { useEffect, useState } from "react";
import { SectionHeading } from "./SectionHeading";
import { RevealItem, RevealStagger } from "./motion";

type TeamMember = {
  id: string;
  name: string;
  role: string;
  initials: string;
  gradient: string;
  bio: string;
  image_url: string | null;
};

export default function Team() {
  const [team, setTeam] = useState<TeamMember[]>([]);

  useEffect(() => {
    fetch("/api/team")
      .then((res) => res.json())
      .then((data) => setTeam(data))
      .catch(console.error);
  }, []);

  return (
    <section id="team" className="relative px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          tag="Who we are"
          title={
            <>
              The people behind <span className="text-gradient">the magic</span>
            </>
          }
          subtitle="A small, senior team obsessed with craft. We sweat the details so you don't have to."
        />

        <RevealStagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {team.map((m) => (
            <RevealItem key={m.id}>
              <div className="group relative h-full overflow-hidden rounded-3xl glass p-6 text-center shadow-lift transition-all duration-300 hover:-translate-y-2 hover:shadow-glow">
                <div className="relative mx-auto mb-5 h-24 w-24">
                  {m.image_url ? (
                    <>
                      <div
                        className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${m.gradient} opacity-60 blur-lg transition-all duration-500 group-hover:opacity-90 group-hover:blur-xl`}
                      />
                      <img
                        src={m.image_url}
                        alt={m.name}
                        className="relative h-24 w-24 rounded-2xl object-cover transition-transform duration-300 group-hover:scale-105 group-hover:-rotate-3"
                      />
                    </>
                  ) : (
                    <>
                      <div
                        className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${m.gradient} opacity-60 blur-lg transition-all duration-500 group-hover:opacity-90 group-hover:blur-xl`}
                      />
                      <div
                        className={`relative flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br ${m.gradient} font-display text-3xl font-bold text-white transition-transform duration-300 group-hover:scale-105 group-hover:-rotate-3`}
                      >
                        {m.initials}
                      </div>
                    </>
                  )}
                </div>
                <h3 className="font-display text-lg font-semibold">{m.name}</h3>
                <p className="mt-1 text-xs font-medium uppercase tracking-widest text-gradient">
                  {m.role}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-mist">{m.bio}</p>
              </div>
            </RevealItem>
          ))}
        </RevealStagger>
      </div>
    </section>
  );
}
