"use client";

import { useEffect, useState } from "react";
import { SectionHeading } from "./SectionHeading";
import { RevealItem, RevealStagger } from "./motion";
import LinkedInIcon from "./LinkedInIcon";
import { getInitials, type TeamMember } from "@/lib/team";

export default function Team() {
  const [members, setMembers] = useState<TeamMember[]>([]);

  useEffect(() => {
    fetch("/api/team")
      .then((res) => res.json())
      .then((data) => setMembers(Array.isArray(data.members) ? data.members : []))
      .catch(console.error);
  }, []);

  if (members.length === 0) {
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
          subtitle="A small, senior team obsessed with craft. We sweat the details so you don't have to."
        />

        <RevealStagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {members.map((member) => {
            const initials = member.initials || getInitials(member.name || "?");

            return (
              <RevealItem key={member.id}>
                <div className="group relative flex h-full flex-col overflow-hidden rounded-3xl glass p-6 text-center shadow-lift transition-all duration-300 hover:-translate-y-2 hover:shadow-glow">
                  <div className="relative mx-auto mb-5 h-24 w-24">
                    {member.imageUrl ? (
                      <>
                        <img
                          src={member.imageUrl}
                          alt={member.name}
                          className="relative h-24 w-24 rounded-xl border border-white/10 object-cover"
                        />
                      </>
                    ) : (
                      <>
                        <div
                          className="relative flex h-24 w-24 items-center justify-center rounded-xl border border-white/10 bg-slate-700 font-display text-2xl font-semibold text-white"
                        >
                          {initials}
                        </div>
                      </>
                    )}
                  </div>

                  <h3 className="font-display text-lg font-semibold leading-snug">
                    {member.name}
                  </h3>
                  {member.role && (
                    <p className="mx-auto mt-1.5 max-w-[14rem] text-xs font-medium leading-relaxed text-blue-300">
                      {member.role}
                    </p>
                  )}
                  <div className="mt-auto flex items-center justify-center gap-3 pt-3">
                    {member.linkedinUrl && (
                      <a
                        href={member.linkedinUrl}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`${member.name} on LinkedIn`}
                        className="text-mist transition-colors hover:text-sky-300"
                      >
                        <LinkedInIcon className="h-4 w-4" />
                      </a>
                    )}
                    {member.profileUrl && (
                      <a
                        href={member.profileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-block text-xs text-mist underline-offset-4 transition-colors hover:text-white hover:underline"
                      >
                        View portfolio
                      </a>
                    )}
                  </div>
                </div>
              </RevealItem>
            );
          })}
        </RevealStagger>
      </div>
    </section>
  );
}
