"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { getInitials, type TeamMember } from "@/lib/team";
import LinkedInIcon from "@/components/LinkedInIcon";
import { motion } from "framer-motion";

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
    const headers: Record<string, string> = {};
    if (session?.access_token) headers.Authorization = `Bearer ${session.access_token}`;

    fetch("/api/team", { headers })
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
  }, [session?.access_token]);

  if (state === "loading" || authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink px-6 py-16 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 text-center">
          <Link href="/" className="mb-6 inline-block">
            <span className="font-display text-2xl font-semibold tracking-tight">
              Kavi<span className="text-gradient">Solutions</span>
            </span>
          </Link>
          <h1 className="mt-4 font-display text-4xl font-bold sm:text-5xl">
            Meet the <span className="text-gradient">Team</span>
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-mist">
            {settings.tagline ||
              settings.description ||
              "The people behind Kavi Solutions — a small, senior team obsessed with craft."}
          </p>
        </div>

        {state === "error" && (
          <p className="text-center text-sm text-red-400">{error}</p>
        )}

        {state === "ready" && members.length === 0 && (
          <p className="text-center text-sm text-mist">
            Team details are being updated. Please check back soon.
          </p>
        )}

        {members.length > 0 && (
          <div>
            <div className="mb-10 flex flex-wrap items-center justify-center gap-4">
              <div className="rounded-2xl glass px-6 py-4 text-center">
                <p className="font-display text-2xl font-bold">{members.length}</p>
                <p className="text-xs uppercase tracking-widest text-mist">Members</p>
              </div>
              {isAdmin && (
                <Link
                  href="/admin"
                  className="rounded-2xl bg-gradient-to-r from-violet-600 to-sky-500 px-6 py-4 text-sm font-semibold shadow-glow transition-all hover:scale-[1.02]"
                >
                  Manage team →
                </Link>
              )}
              {ownMemberId && !isAdmin && (
                <Link
                  href="/profile"
                  className="rounded-2xl bg-white/5 px-6 py-4 text-sm font-semibold text-mist transition-all hover:bg-white/10 hover:text-white"
                >
                  Edit my profile →
                </Link>
              )}
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {members.map((member, i) => {
                const gradient = member.gradient;
                const initials = member.initials || getInitials(member.name || "?");

                return (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    className="group relative flex h-full flex-col overflow-hidden rounded-3xl glass p-6 text-center shadow-lift transition-all duration-300 hover:-translate-y-2 hover:shadow-glow"
                  >
                    <div className="relative mx-auto mb-5 h-28 w-28">
                      {member.imageUrl ? (
                        <>
                          <div
                            className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${gradient} opacity-60 blur-lg transition-all duration-500 group-hover:opacity-90 group-hover:blur-xl`}
                          />
                          <img
                            src={member.imageUrl}
                            alt={member.name}
                            className="relative h-28 w-28 rounded-2xl object-cover transition-transform duration-300 group-hover:scale-105 group-hover:-rotate-3"
                          />
                        </>
                      ) : (
                        <>
                          <div
                            className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${gradient} opacity-60 blur-lg transition-all duration-500 group-hover:opacity-90 group-hover:blur-xl`}
                          />
                          <div
                            className={`relative flex h-28 w-28 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} font-display text-3xl font-bold text-white transition-transform duration-300 group-hover:scale-105 group-hover:-rotate-3`}
                          >
                            {initials}
                          </div>
                        </>
                      )}
                    </div>

                    <h3 className="font-display text-lg font-semibold leading-snug">
                      {member.name}
                    </h3>
                    <p className="mx-auto mt-1.5 max-w-[14rem] text-[11px] font-semibold uppercase leading-relaxed tracking-[0.16em] text-gradient">
                      {member.role || "Team member"}
                    </p>
                    {member.teamName && (
                      <p className="mx-auto mt-1.5">
                        <span className="inline-block rounded-lg bg-sky-500/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-sky-300">
                          {member.teamName}
                        </span>
                      </p>
                    )}
                    {member.bio && (
                      <p className="mt-3 text-xs leading-relaxed text-mist">{member.bio}</p>
                    )}
                    <div className="mt-auto flex items-center justify-center gap-3 pt-4">
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
                      {member.profileUrl ? (
                        <a
                          href={member.profileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-block text-xs text-mist underline-offset-4 transition-colors hover:text-white hover:underline"
                        >
                          View portfolio
                        </a>
                      ) : null}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
