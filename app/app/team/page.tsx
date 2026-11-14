"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { getInitials, type TeamMember } from "@/lib/team";
import LinkedInIcon from "@/components/LinkedInIcon";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Reveal, RevealItem, RevealStagger, TiltCard } from "@/components/motion";

type TeamResponse = {
  members: TeamMember[];
  settings: { tagline: string; description: string };
  isAdmin: boolean;
  member: { id: string; name: string } | null;
};

export default function TeamPage() {
  const { session, loading: authLoading } = useAuth();

  const [members, setMembers] = useState<TeamMember[]>([]);
  const [settings, setSettings] = useState({ tagline: "", description: "" });
  const [isAdmin, setIsAdmin] = useState(false);
  const [ownMemberId, setOwnMemberId] = useState<string | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/team", { credentials: "include" })
      .then((res) => res.json())
      .then((data: TeamResponse & { error?: string }) => {
        if (data.error) {
          setError(data.error);
          setState("error");
          return;
        }
        setMembers(Array.isArray(data.members) ? data.members : []);
        setSettings(data.settings || { tagline: "", description: "" });
        setIsAdmin(Boolean(data.isAdmin));
        setOwnMemberId(data.member?.id ?? null);
        setState("ready");
      })
      .catch(() => {
        setError("Could not load the team");
        setState("error");
      });
  }, [session?.user?.id]);

  return (
    <div className="min-h-screen bg-ink font-sans text-white flex flex-col justify-between">
      <Navbar />

      <main className="px-6 pt-36 pb-20 flex-grow">
        <div className="mx-auto max-w-[1152px]">
          <Reveal className="mb-12 text-center">
            <div className="inline-flex items-center gap-2 mb-3">
              <span className="h-2 w-2 rounded-full bg-[#3B82F6]" />
              <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-[#7889A0]">
                STUDIO LEADERSHIP &amp; CRAFT
              </span>
            </div>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-[#F7F9FC]">
              Meet the <span className="bg-gradient-to-r from-[#91B4FF] to-[#68FCBF] bg-clip-text text-transparent">Team</span>
            </h1>
            <p className="mx-auto mt-4 max-w-lg text-base text-[#A5B3C7]">
              {settings.tagline ||
                settings.description ||
                "The people behind Kavi Solutions — a senior collective of system architects and design engineers."}
            </p>
          </Reveal>

          {state === "loading" && (
            <div className="flex h-64 items-center justify-center text-sm font-mono text-[#7889A0]">
              Connecting to team registry...
            </div>
          )}

          {state === "error" && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-6 text-center text-sm text-red-300">
              {error}
            </div>
          )}

          {state === "ready" && members.length === 0 && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-12 text-center text-sm text-[#A5B3C7]">
              Team details are being updated. Please check back soon.
            </div>
          )}

          {state === "ready" && members.length > 0 && (
            <div>
              <div className="mb-10 flex flex-wrap items-center justify-center gap-4">
                <div className="rounded-full bg-[#19202E] border border-[rgba(148,163,184,0.14)] px-5 py-2 text-center flex items-center gap-2">
                  <span className="font-mono text-sm font-semibold text-[#F7F9FC]">
                    {members.length}
                  </span>
                  <span className="text-[11px] uppercase tracking-wider text-[#7889A0] font-mono">
                    Staff &amp; Architects
                  </span>
                </div>
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="rounded-full bg-[#175CD3] hover:bg-[#1849A9] px-5 py-2 text-xs font-mono font-medium text-white shadow-[0_0_20px_rgba(23,92,211,0.35)] transition-all"
                  >
                    Manage team console →
                  </Link>
                )}
                {ownMemberId && !isAdmin && (
                  <Link
                    href="/profile"
                    className="rounded-full bg-white/5 border border-white/10 px-5 py-2 text-xs font-mono font-medium text-[#A5B3C7] hover:text-white transition-all"
                  >
                    Edit my profile →
                  </Link>
                )}
              </div>

              <RevealStagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {members.map((member) => {
                  const gradient = member.gradient || "from-blue-600 to-indigo-600";
                  const initials = member.initials || getInitials(member.name || "?");

                  return (
                    <RevealItem key={member.id}>
                      <TiltCard
                        intensity={10}
                        className="group relative flex h-full flex-col justify-between overflow-hidden rounded-[24px] bg-[rgba(18,29,47,0.85)] backdrop-blur-[16px] border border-[rgba(148,163,184,0.16)] p-6 sm:p-7 text-center shadow-[0_15px_35px_-10px_rgba(0,0,0,0.4)] hover:border-[rgba(148,163,184,0.35)] transition-all"
                      >
                        <div className="relative mx-auto mb-5 h-24 w-24">
                          {member.imageUrl ? (
                            <img
                              src={member.imageUrl}
                              alt={member.name}
                              className="relative h-24 w-24 rounded-2xl object-cover border border-white/15 shadow-inner"
                            />
                          ) : (
                            <div
                              className={`relative flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} font-display text-2xl font-bold text-white border border-white/15 shadow-inner`}
                            >
                              {initials}
                            </div>
                          )}
                        </div>

                        <div>
                          <h3 className="font-display text-lg font-semibold text-[#F7F9FC] leading-snug">
                            {member.name}
                          </h3>
                          {member.role && (
                            <p className="mx-auto mt-1 max-w-[14rem] text-xs font-mono font-medium text-[#91B4FF]">
                              {member.role}
                            </p>
                          )}
                          {member.teamName && (
                            <span className="inline-block mt-2 rounded-full bg-[#151B2A] border border-[rgba(148,163,184,0.14)] px-2.5 py-0.5 text-[10px] font-mono text-[#45dfa4]">
                              {member.teamName}
                            </span>
                          )}
                          {member.bio && (
                            <p className="mt-3 text-xs leading-relaxed text-[#7889A0]">
                              {member.bio}
                            </p>
                          )}
                        </div>

                        <div className="mt-6 flex items-center justify-center gap-3 pt-3 border-t border-[rgba(148,163,184,0.1)] w-full">
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
                              className="text-xs text-[#7889A0] hover:text-white transition-colors"
                            >
                              Portfolio
                            </a>
                          )}
                        </div>
                      </TiltCard>
                    </RevealItem>
                  );
                })}
              </RevealStagger>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
