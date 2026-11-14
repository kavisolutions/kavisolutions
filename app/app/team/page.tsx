"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Handshake } from "lucide-react";
import type { TeamMember, TeamSettings } from "@/lib/team";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Reveal, RevealItem, RevealStagger, TiltCard } from "@/components/motion";

type DisplayTeamMember = TeamMember & {
  domain?: string;
};

const STITCH_TEAM_MEMBERS: DisplayTeamMember[] = [
  {
    id: "kv-raman",
    name: "K. V. Raman",
    role: "Principal Architect & Founder",
    bio: "Ex-systems lead, 20+ years building mission-critical distributed systems and compiler tech.",
    initials: "KR",
    gradient: "from-blue-500 to-cyan-500",
    imageUrl: null,
    profileUrl: null,
    linkedinUrl: null,
    sortOrder: 1,
    teamId: null,
    teamName: "Core Architecture",
    domain: "Architecture",
  },
  {
    id: "s-nandini",
    name: "S. Nandini",
    role: "Head of Product Architecture",
    bio: "Ex-design lead crafting high-conversion fintech and cryptographic interfaces.",
    initials: "SN",
    gradient: "from-violet-500 to-pink-500",
    imageUrl: null,
    profileUrl: null,
    linkedinUrl: null,
    sortOrder: 2,
    teamId: null,
    teamName: "Product",
    domain: "Design",
  },
  {
    id: "arjun-mehta",
    name: "Arjun Mehta",
    role: "VP of Engineering",
    bio: "Specialist in container orchestration, cloud resilience, and Rust microservices.",
    initials: "AM",
    gradient: "from-sky-500 to-indigo-500",
    imageUrl: null,
    profileUrl: null,
    linkedinUrl: null,
    sortOrder: 3,
    teamId: null,
    teamName: "Engineering",
    domain: "Infrastructure",
  },
  {
    id: "priya-deshmukh",
    name: "Priya Deshmukh",
    role: "Director of Growth & Mktg",
    bio: "Growth architect scaling B2B enterprise software and attribution funnels.",
    initials: "PD",
    gradient: "from-emerald-500 to-teal-500",
    imageUrl: null,
    profileUrl: null,
    linkedinUrl: null,
    sortOrder: 4,
    teamId: null,
    teamName: "Growth",
    domain: "Growth",
  },
  {
    id: "harish-chandra",
    name: "Harish Chandra",
    role: "Principal Field Systems Eng",
    bio: "Offline GIS networks, LoRa telemetry, and pan-India hardware integration.",
    initials: "HC",
    gradient: "from-amber-500 to-orange-500",
    imageUrl: null,
    profileUrl: null,
    linkedinUrl: null,
    sortOrder: 5,
    teamId: null,
    teamName: "Field Systems",
    domain: "Field Tech",
  },
  {
    id: "meera-sen",
    name: "Meera Sen",
    role: "Lead AI & Applied ML",
    bio: "Deterministic RAG, LLM safety guardrails, and computer vision models.",
    initials: "MS",
    gradient: "from-purple-500 to-violet-500",
    imageUrl: null,
    profileUrl: null,
    linkedinUrl: null,
    sortOrder: 6,
    teamId: null,
    teamName: "AI Research",
    domain: "Applied AI",
  },
  {
    id: "rohit-nair",
    name: "Rohit Nair",
    role: "Senior Full-Stack Architect",
    bio: "Next.js, distributed database partitioning, and real-time WebSockets.",
    initials: "RN",
    gradient: "from-rose-500 to-red-500",
    imageUrl: null,
    profileUrl: null,
    linkedinUrl: null,
    sortOrder: 7,
    teamId: null,
    teamName: "Full Stack",
    domain: "Engineering",
  },
  {
    id: "divya-patel",
    name: "Divya Patel",
    role: "Operations & Fellowship Dir",
    bio: "Vipassana practitioner, talent incubation, and cohort field leadership.",
    initials: "DP",
    gradient: "from-cyan-500 to-blue-500",
    imageUrl: null,
    profileUrl: null,
    linkedinUrl: null,
    sortOrder: 8,
    teamId: null,
    teamName: "Fellowship",
    domain: "Fellowship",
  },
];

const SPECIALIZATION_MATRIX = [
  { label: "Distributed Systems & Low-Level Protocols", value: 96 },
  { label: "Cloud Resilience & Kubernetes Orchestration", value: 98 },
  { label: "LLM Guardrails & Applied AI Architectures", value: 94 },
  { label: "Product Design & Cryptographic Interfaces", value: 92 },
];

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function getAvatarGradient(index: number): string {
  const gradients = [
    "from-[#2563EB] to-[#06B6D4]",
    "from-[#8B5CF6] to-[#EC4899]",
    "from-[#06B6D4] to-[#10B981]",
    "from-[#F59E0B] to-[#EF4444]",
    "from-[#3B82F6] to-[#8B5CF6]",
    "from-[#10B981] to-[#3B82F6]",
    "from-[#6366F1] to-[#D946EF]",
    "from-[#14B8A6] to-[#6366F1]",
  ];
  return gradients[index % gradients.length];
}

export default function TeamPage() {
  const [members, setMembers] = useState<DisplayTeamMember[]>(STITCH_TEAM_MEMBERS);
  const [settings, setSettings] = useState<TeamSettings>({
    tagline: "Meet the Team",
    description: "The people behind Kavi Solutions — a senior collective of systems architects, product engineers, and fellowship leaders.",
  });

  useEffect(() => {
    fetch("/api/team")
      .then((res) => res.json())
      .then((data: { members?: TeamMember[]; settings?: TeamSettings; error?: string }) => {
        if (!data.error && Array.isArray(data.members) && data.members.length > 0) {
          setMembers(data.members);
        }
        if (data.settings?.description) {
          setSettings(data.settings);
        }
      })
      .catch(() => {
        // Fallback to Stitch team data
      });
  }, []);

  return (
    <div className="min-h-screen bg-ink font-sans text-[#F7F9FC] flex flex-col justify-between">
      <Navbar />

      <main className="px-6 pt-36 pb-20 flex-grow">
        <div className="mx-auto max-w-[1152px]">
          {/* Header */}
          <Reveal className="mb-12 text-center">
            <div className="inline-flex items-center gap-2 mb-3">
              <span className="h-2 w-2 rounded-full bg-[#175CD3]" />
              <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-[#91B4FF]">
                STUDIO LEADERSHIP &amp; TALENT
              </span>
            </div>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-[#F7F9FC]">
              Meet the <span className="bg-gradient-to-r from-[#91B4FF] to-[#68FCBF] bg-clip-text text-transparent">Team</span>
            </h1>
            <p className="mx-auto mt-4 max-w-lg text-base text-[#A5B3C7]">
              {settings.description || "The people behind Kavi Solutions — a senior collective of system architects and design engineers."}
            </p>
          </Reveal>

          {/* Metric Pill */}
          <div className="mb-10 flex flex-wrap items-center justify-center gap-4">
            <div className="rounded-full bg-[#19202E] border border-[rgba(148,163,184,0.14)] px-5 py-2 text-center flex items-center gap-2">
              <span className="font-mono text-sm font-semibold text-[#F7F9FC]">
                {members.length}
              </span>
              <span className="text-[11px] uppercase tracking-wider text-[#7889A0] font-mono">
                Staff &amp; Architects
              </span>
            </div>
          </div>

          {/* Members Grid with 3D Tilt */}
          <RevealStagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {members.map((member, index) => (
              <RevealItem key={member.id || member.name}>
                <TiltCard
                  intensity={9}
                  className="group relative flex h-full flex-col justify-between overflow-hidden rounded-[24px] bg-[rgba(18,29,47,0.85)] backdrop-blur-[16px] border border-[rgba(148,163,184,0.16)] p-6 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] hover:border-[rgba(148,163,184,0.35)] transition-all"
                >
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#2563EB] to-[#06B6D4]" />

                  <div>
                    {/* Avatar */}
                    <div className="mb-5 flex items-center justify-between">
                      <div
                        className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${getAvatarGradient(
                          index
                        )} text-white font-mono text-lg font-bold shadow-lg shadow-blue-500/20`}
                      >
                        {getInitials(member.name)}
                      </div>
                      {member.domain && (
                        <span className="rounded-full bg-[#151B2A] border border-[rgba(148,163,184,0.14)] px-3 py-1 text-[11px] font-mono text-[#91B4FF]">
                          {member.domain}
                        </span>
                      )}
                    </div>

                    <h3 className="font-display text-lg font-semibold text-[#F7F9FC] mb-1">
                      {member.name}
                    </h3>
                    <p className="text-xs font-mono font-medium text-[#91B4FF] mb-3">
                      {member.role}
                    </p>
                    {member.bio && (
                      <p className="text-[13px] leading-relaxed text-[#A5B3C7]">
                        {member.bio}
                      </p>
                    )}
                  </div>

                  <div className="mt-5 flex items-center gap-3 border-t border-[rgba(148,163,184,0.12)] pt-4 text-[#7889A0]">
                    <span className="text-[11px] font-mono">Kavi Solutions</span>
                  </div>
                </TiltCard>
              </RevealItem>
            ))}
          </RevealStagger>

          {/* Specialization Matrix from Stitch P05 */}
          <Reveal className="mt-16">
            <div className="rounded-[24px] bg-[rgba(18,29,47,0.85)] backdrop-blur-[16px] border border-[rgba(148,163,184,0.16)] p-8 sm:p-10 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)]">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="max-w-md">
                  <span className="font-mono text-[11px] font-semibold text-[#91B4FF] uppercase tracking-[0.2em] mb-2 block">
                    LEADERSHIP &amp; TALENT
                  </span>
                  <h3 className="font-display text-2xl font-semibold text-[#F7F9FC] mb-2">
                    Specialization Matrix
                  </h3>
                  <p className="text-sm text-[#A5B3C7] leading-relaxed">
                    Core competencies across current leadership, partner engineering, and active cohort teams.
                  </p>
                </div>

                <div className="flex-grow max-w-xl space-y-4">
                  {SPECIALIZATION_MATRIX.map((item) => (
                    <div key={item.label}>
                      <div className="flex justify-between text-xs font-mono mb-1.5">
                        <span className="text-[#A5B3C7]">{item.label}</span>
                        <span className="text-[#91B4FF] font-semibold">{item.value}%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-[#070E1C] overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#175CD3] to-[#91B4FF]"
                          style={{ width: `${item.value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>

          {/* Want to build with us? CTA from Stitch P05 */}
          <Reveal className="mt-16 text-center">
            <div className="relative overflow-hidden rounded-[28px] border border-[rgba(148,163,184,0.18)] bg-[rgba(18,29,47,0.85)] backdrop-blur-[20px] p-10 sm:p-14 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.6)]">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#2563EB] via-[#91B4FF] to-[#06B6D4]" />
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#175CD3]/20 border border-[#175CD3]/30 text-[#91B4FF]">
                <Handshake className="h-6 w-6" />
              </div>
              <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-[#F7F9FC] mb-3">
                Want to build with us?
              </h2>
              <p className="mx-auto max-w-lg text-base text-[#A5B3C7] mb-8 leading-relaxed">
                We are always looking for uncompromising systems architects, deep-tech researchers, and ambitious fellows.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/#contact"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-[12px] bg-[#175CD3] hover:bg-[#1849A9] text-white px-8 text-[15px] font-medium transition-all shadow-[0_0_24px_rgba(23,92,211,0.4)]"
                >
                  <span>Apply to join</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </main>

      <Footer />
    </div>
  );
}
