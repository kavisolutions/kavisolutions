"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAuth, supabaseBrowser } from "@/lib/auth-context";
import { type FolioTeam } from "@/lib/folio-team";
import { motion } from "framer-motion";

type TeamMember = {
  id: string;
  name: string;
  role: string;
  initials: string;
  gradient: string;
  bio: string;
  image_url: string | null;
  user_id: string | null;
};

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

function EditProfileForm({
  profile,
  onSave,
  onCancel,
}: {
  profile: TeamMember;
  onSave: (updated: TeamMember) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    name: profile.name,
    role: profile.role,
    bio: profile.bio,
    gradient: profile.gradient,
    image_url: profile.image_url,
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const { data: { session } } = await supabaseBrowser.auth.getSession();
    if (!session) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("token", session.access_token);

    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();

    if (data.url) {
      setForm((prev) => ({ ...prev, image_url: data.url }));
      setMessage("Photo uploaded!");
    } else {
      setMessage(data.error || "Upload failed");
    }
    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const res = await fetch("/api/team", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: profile.id,
        ...form,
        initials: getInitials(form.name),
      }),
    });

    const data = await res.json();
    if (data.error) {
      setMessage(data.error);
    } else {
      setMessage("Profile updated!");
      onSave(data);
    }
    setSaving(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-xl rounded-3xl glass p-6 shadow-lift"
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-xl font-bold">Edit Profile</h2>
        <button
          onClick={onCancel}
          className="rounded-lg bg-white/5 px-3 py-1.5 text-xs text-mist transition-colors hover:bg-white/10 hover:text-white"
        >
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="relative shrink-0">
            {form.image_url ? (
              <img
                src={form.image_url}
                alt="Preview"
                className="h-20 w-20 rounded-2xl object-cover"
              />
            ) : (
              <div
                className={`flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br ${form.gradient} font-display text-2xl font-bold text-white`}
              >
                {form.name ? getInitials(form.name) : "?"}
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleImageUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="rounded-lg bg-white/5 px-4 py-2 text-xs text-mist transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50"
            >
              {uploading ? "Uploading..." : form.image_url ? "Change photo" : "Upload photo"}
            </button>
            {form.image_url && (
              <button
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, image_url: null }))}
                className="rounded-lg bg-red-500/10 px-4 py-2 text-xs text-red-400 transition-colors hover:bg-red-500/20"
              >
                Remove photo
              </button>
            )}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-mist">Name</label>
            <input
              required
              placeholder="Your name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition-colors placeholder:text-fog focus:border-violet-400/60"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-mist">Role</label>
            <input
              required
              placeholder="Your role"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition-colors placeholder:text-fog focus:border-violet-400/60"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-mist">Bio</label>
          <textarea
            required
            placeholder="Tell us about yourself..."
            rows={3}
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition-colors placeholder:text-fog focus:border-violet-400/60"
          />
        </div>

        <div>
          <label className="mb-2 block text-xs font-medium text-mist">
            Avatar gradient
          </label>
          <div className="flex flex-wrap gap-2">
            {gradients.map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setForm({ ...form, gradient: g })}
                className={`h-8 w-8 rounded-lg bg-gradient-to-br ${g} transition-all ${
                  form.gradient === g
                    ? "ring-2 ring-white ring-offset-2 ring-offset-ink scale-110"
                    : "opacity-60 hover:opacity-100"
                }`}
              />
            ))}
          </div>
        </div>

        {message && (
          <p
            className={`rounded-lg px-4 py-2 text-sm ${
              message.includes("failed") || message.includes("error")
                ? "bg-red-500/10 text-red-400"
                : "bg-emerald-500/10 text-emerald-400"
            }`}
          >
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-sky-500 py-3 text-sm font-semibold text-white shadow-glow transition-all hover:scale-[1.02] disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save changes"}
        </button>
      </form>
    </motion.div>
  );
}

export default function TeamPage() {
  const { session, loading: authLoading } = useAuth();
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  const [folio, setFolio] = useState<FolioTeam | null>(null);
  const [folioState, setFolioState] = useState<"loading" | "ready" | "unconfigured" | "error">("loading");
  const [folioError, setFolioError] = useState("");
  const [showConnect, setShowConnect] = useState(false);
  const [folioToken, setFolioToken] = useState("");
  const [folioSlug, setFolioSlug] = useState("");
  const [connectError, setConnectError] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  useEffect(() => {
    fetch("/api/team")
      .then((res) => res.json())
      .then((data) => {
        setTeam(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetch("/api/folio-team")
      .then((res) => res.json())
      .then((data) => {
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
  }, []);

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

  const handleGoogleLogin = async () => {
    await supabaseBrowser.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin + "/team",
      },
    });
  };

  const myProfile = session
    ? team.find((m) => m.user_id === session.user.id) || null
    : null;

  const handleSave = (updated: TeamMember) => {
    setTeam((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
    setEditing(false);
  };

  const handleSignOut = async () => {
    await supabaseBrowser.auth.signOut();
    setEditing(false);
  };

  if (loading || authLoading) {
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
            The people behind Kavi Solutions — a small, senior team obsessed with craft.
          </p>
        </div>

        {/* Auth: show Edit profile when logged in, Google sign-in when not */}
        {!session ? (
          <div className="mb-10 text-center">
            <button
              onClick={handleGoogleLogin}
              className="inline-flex items-center gap-3 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-gray-800 shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </button>
          </div>
        ) : (
          <div className="mb-10 text-center">
            {myProfile && (
              <button
                onClick={() => setEditing((v) => !v)}
                className="inline-flex items-center gap-3 rounded-xl bg-gradient-to-r from-violet-600 to-sky-500 px-5 py-3 text-sm font-semibold text-white shadow-glow transition-all hover:scale-[1.02]"
              >
                {editing ? "Close editor" : "Edit my profile"}
              </button>
            )}
            <div className="mt-4 flex flex-col items-center gap-2">
              <p className="text-sm text-mist">
                Signed in as <span className="text-white">{session.user.email}</span>
              </p>
              {!myProfile && (
                <p className="text-xs text-mist">
                  Your account is not linked to a team profile yet.
                </p>
              )}
              <button
                onClick={handleSignOut}
                className="rounded-lg bg-white/5 px-4 py-2 text-xs text-mist transition-colors hover:bg-white/10 hover:text-white"
              >
                Sign out
              </button>
            </div>
          </div>
        )}

        {editing && myProfile && (
          <div className="mb-10">
            <EditProfileForm
              profile={myProfile}
              onSave={handleSave}
              onCancel={() => setEditing(false)}
            />
          </div>
        )}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {team.map((m, i) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group relative h-full overflow-hidden rounded-3xl glass p-6 text-center shadow-lift transition-all duration-300 hover:-translate-y-2 hover:shadow-glow"
            >
              <div className="relative mx-auto mb-5 h-28 w-28">
                {m.image_url ? (
                  <>
                    <div
                      className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${m.gradient} opacity-60 blur-lg transition-all duration-500 group-hover:opacity-90 group-hover:blur-xl`}
                    />
                    <img
                      src={m.image_url}
                      alt={m.name}
                      className="relative h-28 w-28 rounded-2xl object-cover transition-transform duration-300 group-hover:scale-105 group-hover:-rotate-3"
                    />
                  </>
                ) : (
                  <>
                    <div
                      className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${m.gradient} opacity-60 blur-lg transition-all duration-500 group-hover:opacity-90 group-hover:blur-xl`}
                    />
                    <div
                      className={`relative flex h-28 w-28 items-center justify-center rounded-2xl bg-gradient-to-br ${m.gradient} font-display text-3xl font-bold text-white transition-transform duration-300 group-hover:scale-105 group-hover:-rotate-3`}
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
            </motion.div>
          ))}
        </div>

        {/* Folio team */}
        <section className="mt-24">
          <div className="mb-10 text-center">
            <h2 className="font-display text-3xl font-bold sm:text-4xl">
              Our <span className="text-gradient">Folio</span> Team
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-mist">
              Live team data from our folio portfolio — members, shared projects, and the public team page.
            </p>
          </div>

          {folioState === "loading" && (
            <p className="text-center text-sm text-mist">Loading folio team...</p>
          )}

          {folioState === "unconfigured" && (
            <p className="text-center text-sm text-mist">Folio team is not connected yet.</p>
          )}

          {folioState === "error" && (
            <p className="text-center text-sm text-red-400">{folioError}</p>
          )}

          {folio && (
            <div>
              <div className="mb-8 flex flex-wrap items-center justify-center gap-4">
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

              {(folio.tagline || folio.description) && (
                <p className="mx-auto mb-8 max-w-2xl text-center text-mist">
                  {folio.tagline || folio.description}
                </p>
              )}

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
                      <div className="relative mx-auto mb-5 h-24 w-24">
                        {member.photo ? (
                          <>
                            <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${gradient} opacity-60 blur-lg transition-all duration-500 group-hover:opacity-90`} />
                            <img
                              src={member.photo}
                              alt={member.name}
                              className="relative h-24 w-24 rounded-2xl object-cover"
                            />
                          </>
                        ) : (
                          <>
                            <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${gradient} opacity-60 blur-lg transition-all duration-500 group-hover:opacity-90`} />
                            <div className={`relative flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} font-display text-2xl font-bold text-white`}>
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

          {session && (
            <div className="mt-10 text-center">
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
                    placeholder="Team slug (e.g. ast)"
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
        </section>
      </div>
    </div>
  );
}
