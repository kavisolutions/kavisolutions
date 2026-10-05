"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth, supabaseBrowser } from "@/lib/auth-context";
import { type FolioTeam } from "@/lib/folio-team";
import { motion } from "framer-motion";

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

export default function TeamPage() {
  const { session, loading: authLoading } = useAuth();

  const [folio, setFolio] = useState<FolioTeam | null>(null);
  const [folioState, setFolioState] = useState<"loading" | "ready" | "unconfigured" | "error">("loading");
  const [folioError, setFolioError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [showConnect, setShowConnect] = useState(false);
  const [folioToken, setFolioToken] = useState("");
  const [folioSlug, setFolioSlug] = useState("");
  const [connectError, setConnectError] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  useEffect(() => {
    const headers: Record<string, string> = {};
    if (session?.access_token) headers.Authorization = `Bearer ${session.access_token}`;

    fetch("/api/folio-team", { headers })
      .then((res) => res.json())
      .then((data) => {
        setIsAdmin(Boolean(data.isAdmin));

        if (!data.configured) {
          setFolioState("unconfigured");
          return;
        }
        if (data.team) {
          setFolio(data.team);
          setFolioState("ready");
          return;
        }
        setFolioError(data.error || "Could not load the folio team");
        setFolioState("error");
      })
      .catch(() => {
        setFolioError("Could not load the folio team");
        setFolioState("error");
      });
  }, [session?.access_token]);

  const handleGoogleLogin = async () => {
    await supabaseBrowser.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin + "/team",
      },
    });
  };

  const handleSignOut = async () => {
    await supabaseBrowser.auth.signOut();
    setShowConnect(false);
  };

  const handleFolioConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (connecting) return;

    setConnecting(true);
    setConnectError("");

    const { data: { session: currentSession } } = await supabaseBrowser.auth.getSession();

    const res = await fetch("/api/folio-team", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${currentSession?.access_token ?? ""}`,
      },
      body: JSON.stringify({ token: folioToken, slug: folioSlug }),
    });

    const data = await res.json();

    if (!res.ok) {
      setConnectError(data.error || "Failed to connect");
      setConnecting(false);
      return;
    }

    setFolio(data.team);
    setFolioState("ready");
    setShowConnect(false);
    setFolioToken("");
    setFolioSlug("");
    setConnecting(false);
  };

  const handleFolioDisconnect = async () => {
    if (disconnecting) return;

    setDisconnecting(true);
    setConnectError("");

    const { data: { session: currentSession } } = await supabaseBrowser.auth.getSession();

    const res = await fetch("/api/folio-team", {
      method: "DELETE",
      headers: { Authorization: `Bearer ${currentSession?.access_token ?? ""}` },
    });

    const data = await res.json();

    if (!res.ok) {
      setConnectError(data.error || "Failed to disconnect");
      setDisconnecting(false);
      return;
    }

    setFolio(null);
    setFolioState("unconfigured");
    setShowConnect(false);
    setDisconnecting(false);
  };

  if (folioState === "loading" || authLoading) {
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
            {folio?.tagline ||
              folio?.description ||
              "The people behind Kavi Solutions — a small, senior team obsessed with craft."}
          </p>
        </div>

        {folioState === "error" && (
          <p className="text-center text-sm text-red-400">{folioError}</p>
        )}

        {folioState === "unconfigured" && (
          <p className="text-center text-sm text-mist">
            Team details are being updated. Please check back soon.
          </p>
        )}

        {folio && (
          <div>
            <div className="mb-10 flex flex-wrap items-center justify-center gap-4">
              <div className="rounded-2xl glass px-6 py-4 text-center">
                <p className="font-display text-2xl font-bold">{folio.projectsCount}</p>
                <p className="text-xs uppercase tracking-widest text-mist">Shared projects</p>
              </div>
              <div className="rounded-2xl glass px-6 py-4 text-center">
                <p className="font-display text-2xl font-bold">{folio.memberCount}</p>
                <p className="text-xs uppercase tracking-widest text-mist">Members</p>
              </div>
              <a
                href={folio.portfolioUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-2xl bg-gradient-to-r from-violet-600 to-sky-500 px-6 py-4 text-sm font-semibold shadow-glow transition-all hover:scale-[1.02]"
              >
                Open team portfolio →
              </a>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {folio.members.map((member, i) => {
                const gradient = gradients[i % gradients.length];
                const initials = getInitials(member.name || member.username || "?");

                return (
                  <motion.div
                    key={member.id || member.username}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    className="group relative h-full overflow-hidden rounded-3xl glass p-6 text-center shadow-lift transition-all duration-300 hover:-translate-y-2 hover:shadow-glow"
                  >
                    <div className="relative mx-auto mb-5 h-28 w-28">
                      {member.photo ? (
                        <>
                          <div
                            className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${gradient} opacity-60 blur-lg transition-all duration-500 group-hover:opacity-90 group-hover:blur-xl`}
                          />
                          <img
                            src={member.photo}
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
                    {member.profileUrl ? (
                      <a
                        href={member.profileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-4 inline-block text-xs text-mist underline-offset-4 transition-colors hover:text-white hover:underline"
                      >
                        View portfolio
                      </a>
                    ) : (
                      <p className="mt-4 text-xs text-fog">Private portfolio</p>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {isAdmin && (
          <div className="mt-12 text-center">
            <button
              onClick={() => {
                setShowConnect((v) => !v);
                setConnectError("");
              }}
              className="rounded-xl bg-white/5 px-4 py-2 text-xs text-mist transition-colors hover:bg-white/10 hover:text-white"
            >
              {showConnect ? "Close" : folio ? "Change folio connection" : "Connect folio team (admin)"}
            </button>

            {showConnect && (
              <form onSubmit={handleFolioConnect} className="mx-auto mt-5 max-w-md space-y-3 text-left">
                <input
                  value={folioToken}
                  onChange={(e) => setFolioToken(e.target.value)}
                  placeholder="folio_... API token"
                  autoComplete="off"
                  spellCheck={false}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition-colors placeholder:text-fog focus:border-violet-400/60"
                />
                <input
                  value={folioSlug}
                  onChange={(e) => setFolioSlug(e.target.value)}
                  placeholder="Team slug (e.g. kavi-solutions)"
                  autoComplete="off"
                  spellCheck={false}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition-colors placeholder:text-fog focus:border-violet-400/60"
                />

                {connectError && <p className="text-xs text-red-400">{connectError}</p>}

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={connecting}
                    className="flex-1 rounded-xl bg-gradient-to-r from-violet-600 to-sky-500 py-3 text-sm font-semibold shadow-glow transition-all hover:scale-[1.02] disabled:opacity-60"
                  >
                    {connecting ? "Connecting..." : "Connect"}
                  </button>
                  {folio && (
                    <button
                      type="button"
                      onClick={handleFolioDisconnect}
                      disabled={disconnecting}
                      className="rounded-xl bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-400 transition-colors hover:bg-red-500/20 disabled:opacity-60"
                    >
                      {disconnecting ? "Removing..." : "Disconnect"}
                    </button>
                  )}
                </div>

                <p className="text-xs text-mist">
                  Create a token in folio under Settings → API tokens. The token owner must be a member of the team.
                </p>
              </form>
            )}
          </div>
        )}

        <div className="mt-10 text-center">
          {!session ? (
            <button
              onClick={handleGoogleLogin}
              className="inline-flex items-center gap-3 rounded-xl bg-white/5 px-5 py-3 text-sm font-semibold text-mist transition-all hover:bg-white/10 hover:text-white"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Admin sign in with Google
            </button>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <p className="text-xs text-mist">
                Signed in as <span className="text-white">{session.user.email}</span>
              </p>
              <button
                onClick={handleSignOut}
                className="rounded-lg bg-white/5 px-4 py-2 text-xs text-mist transition-colors hover:bg-white/10 hover:text-white"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
