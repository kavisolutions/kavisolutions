"use client";

import { useEffect, useState } from "react";
import { SectionHeading } from "./SectionHeading";
import { RevealItem, RevealStagger } from "./motion";
import { type FolioTeam } from "@/lib/folio-team";

const gradients = [
  "from-violet-500 to-purple-500",
  "from-sky-500 to-cyan-500",
  "from-emerald-500 to-teal-500",
  "from-fuchsia-500 to-pink-500",
  "from-amber-500 to-orange-500",
  "from-rose-500 to-red-500",
  "from-indigo-500 to-blue-500",
  "from-lime-500 to-green-500",
];

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function Team() {
  const [team, setTeam] = useState<FolioTeam | null>(null);

  useEffect(() => {
    fetch("/api/folio-team")
      .then((res) => res.json())
      .then((data) => setTeam(data.configured && data.team ? data.team : null))
      .catch(console.error);
  }, []);

  if (!team || team.members.length === 0) {
    return null;
  }

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
          subtitle={
            team.tagline ||
            team.description ||
            "A small, senior team obsessed with craft. We sweat the details so you don't have to."
          }
        />

        <RevealStagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {team.members.map((member, i) => {
            const gradient = gradients[i % gradients.length];
            const initials = getInitials(member.name || member.username || "?");

            return (
              <RevealItem key={member.id || member.username}>
                <div className="group relative h-full overflow-hidden rounded-3xl glass p-6 text-center shadow-lift transition-all duration-300 hover:-translate-y-2 hover:shadow-glow">
                  <div className="relative mx-auto mb-5 h-24 w-24">
                    {member.photo ? (
                      <>
                        <div
                          className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${gradient} opacity-60 blur-lg transition-all duration-500 group-hover:opacity-90 group-hover:blur-xl`}
                        />
                        <img
                          src={member.photo}
                          alt={member.name}
                          className="relative h-24 w-24 rounded-2xl object-cover transition-transform duration-300 group-hover:scale-105 group-hover:-rotate-3"
                        />
                      </>
                    ) : (
                      <>
                        <div
                          className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${gradient} opacity-60 blur-lg transition-all duration-500 group-hover:opacity-90 group-hover:blur-xl`}
                        />
                        <div
                          className={`relative flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} font-display text-3xl font-bold text-white transition-transform duration-300 group-hover:scale-105 group-hover:-rotate-3`}
                        >
                          {initials}
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex items-center justify-center gap-2">
                    <h3 className="font-display text-lg font-semibold">{member.name}</h3>
                    {member.role === "owner" && (
                      <span className="rounded-full bg-amber-400/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-300">
                        Owner
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs font-medium uppercase tracking-widest text-gradient">
                    {member.jobRole || "Team member"}
                  </p>
                  {member.profileUrl && (
                    <a
                      href={member.profileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-block text-xs text-mist underline-offset-4 transition-colors hover:text-white hover:underline"
                    >
                      View portfolio
                    </a>
                  )}
                </div>
              </RevealItem>
            );
          })}
        </RevealStagger>
      </div>
    </section>
  );
}
