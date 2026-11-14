"use client";

import { useEffect, useState } from "react";
import { Link2 } from "lucide-react";
import { Reveal, RevealItem, RevealStagger, TiltCard } from "./motion";
import LinkedInIcon from "./LinkedInIcon";
import { getInitials, type TeamMember } from "@/lib/team";

const fallbackMembers = [
  {
    id: "1",
    name: "K. V. Raman",
    initials: "KR",
    role: "Principal Architect & Founder",
    bio: "20+ years building mission-critical distributed systems and compiler tech.",
    gradient: "from-[#2563EB] to-[#1D4ED8]",
    linkedinUrl: "https://linkedin.com",
    profileUrl: "#",
  },
  {
    id: "2",
    name: "S. Nandini",
    initials: "SN",
    role: "Head of Product Design",
    bio: "Ex-design lead crafting high-conversion fintech & crypto web interfaces.",
    gradient: "from-[#06B6D4] to-[#0891B2]",
    linkedinUrl: "https://linkedin.com",
    profileUrl: "#",
  },
  {
    id: "3",
    name: "Arjun Mehta",
    initials: "AM",
    role: "VP of Engineering",
    bio: "Specialist in container orchestration, cloud resilience and Rust microservices.",
    gradient: "from-[#8B5CF6] to-[#7C3AED]",
    linkedinUrl: "https://linkedin.com",
    profileUrl: "#",
  },
  {
    id: "4",
    name: "Priya Deshmukh",
    initials: "PD",
    role: "Director of Growth",
    bio: "Growth architect who scaled multiple B2B startups from 0 to $10M ARR.",
    gradient: "from-[#3B82F6] to-[#2563EB]",
    linkedinUrl: "https://linkedin.com",
    profileUrl: "#",
  },
];

const avatarGradients = [
  "from-[#2563EB] to-[#1D4ED8]",
  "from-[#06B6D4] to-[#0891B2]",
  "from-[#8B5CF6] to-[#7C3AED]",
  "from-[#3B82F6] to-[#2563EB]",
];

export default function Team() {
  const [members, setMembers] = useState<TeamMember[]>([]);

  useEffect(() => {
    fetch("/api/team")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.members) && data.members.length > 0) {
          setMembers(data.members);
        } else {
          setMembers(fallbackMembers as unknown as TeamMember[]);
        }
      })
      .catch(() => {
        setMembers(fallbackMembers as unknown as TeamMember[]);
      });
  }, []);

  const displayList = members.length > 0 ? members : (fallbackMembers as unknown as TeamMember[]);

  return (
    <section id="team" className="relative px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-[1152px]">
        {/* Section Header */}
        <Reveal className="mb-12">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="h-2 w-2 rounded-full bg-[#3B82F6]" />
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-[#7889A0]">
              LEADERSHIP &amp; CRAFT
            </span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-[#F7F9FC] mb-4">
            The people behind the magic
          </h2>
          <p className="text-base leading-relaxed text-[#A5B3C7] max-w-xl">
            A senior collective of systems architects, design engineers, and technical growth
            leaders.
          </p>
        </Reveal>

        {/* 4-Column Grid with 3D Tilt */}
        <RevealStagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayList.map((member, i) => {
            const initials = member.initials || getInitials(member.name || "?");
            const grad =
              (member as unknown as { gradient?: string }).gradient ||
              avatarGradients[i % avatarGradients.length];

            return (
              <RevealItem key={member.id}>
                <TiltCard
                  intensity={10}
                  className="group relative h-full rounded-[24px] bg-[rgba(18,29,47,0.85)] backdrop-blur-[16px] border border-[rgba(148,163,184,0.16)] p-6 sm:p-7 flex flex-col items-start shadow-[0_15px_35px_-10px_rgba(0,0,0,0.4)] hover:border-[rgba(148,163,184,0.35)] transition-all"
                >
                  <div className="relative mb-5">
                    {member.imageUrl ? (
                      <img
                        src={member.imageUrl}
                        alt={member.name}
                        className="h-14 w-14 rounded-2xl border border-white/15 object-cover shadow-inner"
                      />
                    ) : (
                      <div
                        className={`h-14 w-14 rounded-2xl bg-gradient-to-tr ${grad} flex items-center justify-center font-display font-semibold text-lg text-white shadow-inner border border-white/15`}
                      >
                        {initials}
                      </div>
                    )}
                  </div>

                  <h3 className="font-display text-lg font-semibold text-[#F7F9FC] mb-1">
                    {member.name}
                  </h3>
                  {member.role && (
                    <p className="text-xs font-mono font-medium text-[#91B4FF] mb-3">
                      {member.role}
                    </p>
                  )}
                  {member.bio && (
                    <p className="text-xs leading-relaxed text-[#7889A0] mb-5">
                      {member.bio}
                    </p>
                  )}

                  <div className="mt-auto flex items-center gap-3 pt-3 border-t border-[rgba(148,163,184,0.1)] w-full">
                    {member.linkedinUrl && (
                      <a
                        href={member.linkedinUrl}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`${member.name} on LinkedIn`}
                        className="text-[#7889A0] hover:text-[#91B4FF] transition-colors"
                      >
                        <LinkedInIcon className="h-4 w-4" />
                      </a>
                    )}
                    {member.profileUrl && (
                      <a
                        href={member.profileUrl}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`${member.name} portfolio`}
                        className="text-[#7889A0] hover:text-[#91B4FF] transition-colors"
                      >
                        <Link2 className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </TiltCard>
              </RevealItem>
            );
          })}
        </RevealStagger>
      </div>
    </section>
  );
}
