"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { supabaseBrowser, useAuth } from "@/lib/auth-context";
import { TEAM_GRADIENTS } from "@/lib/team";

type MeResponse = {
  user: { id: string; email: string } | null;
  isAdmin: boolean;
  member: {
    id: string;
    name: string;
    role: string;
    bio: string;
    imageUrl: string | null;
    profileUrl: string | null;
    gradient: string;
  } | null;
};

const inputClass =
  "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none transition-colors placeholder:text-fog focus:border-violet-400/60";

async function authHeaders(): Promise<Record<string, string>> {
  const { data } = await supabaseBrowser.auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function ProfilePage() {
  const { session, loading: authLoading } = useAuth();

  const [me, setMe] = useState<MeResponse | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [bio, setBio] = useState("");
  const [profileUrl, setProfileUrl] = useState("");
  const [gradient, setGradient] = useState<string>(TEAM_GRADIENTS[0]);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const headers = await authHeaders();
    const res = await fetch("/api/me", { headers });
    const data: MeResponse = await res.json();
    setMe(data);

    if (data.member) {
      setName(data.member.name);
      setRole(data.member.role);
      setBio(data.member.bio ?? "");
      setProfileUrl(data.member.profileUrl ?? "");
      setGradient(data.member.gradient);
      setImageUrl(data.member.imageUrl);
    }
  }, []);

  const initialize = useCallback(
    async (hasSession: boolean) => {
      if (!hasSession) return;

      try {
        await load();
      } catch {
        setError("Could not load your profile");
      } finally {
        setLoaded(true);
      }
    },
    [load],
  );

  useEffect(() => {
    if (authLoading) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async loader updates state after awaits
    void initialize(Boolean(session));
  }, [authLoading, session, initialize]);

  const handleGoogleLogin = async () => {
    await supabaseBrowser.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin + "/profile" },
    });
  };

  const uploadImage = async (file: File) => {
    if (uploading) return;
    setUploading(true);
    setError("");

    const { data } = await supabaseBrowser.auth.getSession();
    const form = new FormData();
    form.append("file", file);
    form.append("token", data.session?.access_token ?? "");

    const res = await fetch("/api/upload", { method: "POST", body: form });
    const body = await res.json().catch(() => null);

    if (!res.ok) {
      setError(body?.error || "Upload failed");
      setUploading(false);
      return;
    }

    setImageUrl(body.url);
    setUploading(false);
  };

  const save = async () => {
    if (!me?.member || saving) return;
    setSaving(true);
    setError("");
    setMessage("");

    const headers = await authHeaders();
    const res = await fetch(`/api/team/${me.member.id}`, {
      method: "PATCH",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ name, role, bio, profileUrl, gradient, imageUrl }),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      setError(data?.error || "Failed to save profile");
      setSaving(false);
      return;
    }

    setMessage("Profile updated");
    setSaving(false);
  };

  if (authLoading || (session && !loaded)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink text-white">
        Loading...
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink px-6 text-white">
        <div className="w-full max-w-md rounded-3xl glass p-8 text-center">
          <h1 className="mb-2 font-display text-2xl font-bold">My Profile</h1>
          <p className="mb-6 text-sm text-mist">Sign in to edit your team profile.</p>
          <button
            onClick={handleGoogleLogin}
            className="w-full rounded-xl bg-white px-4 py-3 text-sm font-semibold text-gray-800 transition-all hover:scale-[1.02]"
          >
            Continue with Google
          </button>
          <Link href="/team" className="mt-4 block text-xs text-mist hover:text-white">
            ← Back to team page
          </Link>
        </div>
      </div>
    );
  }

  if (!me?.member) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink px-6 text-white">
        <div className="w-full max-w-md rounded-3xl glass p-8 text-center">
          <h1 className="mb-2 font-display text-2xl font-bold">No team profile</h1>
          <p className="mb-6 text-sm text-mist">
            {session.user.email} is not linked to a team member yet. Ask an admin to add you to
            the team.
          </p>
          <Link href="/team" className="text-xs text-mist hover:text-white">
            ← Back to team page
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink px-6 py-12 text-white">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 text-center">
          <Link href="/" className="font-display text-xl font-semibold tracking-tight">
            Kavi<span className="text-gradient">Solutions</span>
          </Link>
          <h1 className="mt-3 font-display text-3xl font-bold">My Profile</h1>
          <p className="text-xs text-mist">Signed in as {session.user.email}</p>
        </div>

        <div className="rounded-3xl glass p-6">
          <div className="mb-5 flex items-center gap-4">
            <div className="relative h-20 w-20">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={name}
                  className="h-20 w-20 rounded-2xl object-cover"
                />
              ) : (
                <div
                  className={`flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} font-display text-2xl font-bold`}
                >
                  {name.trim().slice(0, 1).toUpperCase()}
                </div>
              )}
            </div>
            <label className="rounded-xl bg-white/5 px-4 py-2 text-xs text-mist transition-colors hover:bg-white/10 hover:text-white">
              {uploading ? "Uploading..." : "Change photo"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) uploadImage(file);
                }}
              />
            </label>
          </div>

          <div className="space-y-3">
            <input
              className={inputClass}
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              className={inputClass}
              placeholder="Role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />
            <input
              className={inputClass}
              placeholder="Portfolio URL (optional)"
              value={profileUrl}
              onChange={(e) => setProfileUrl(e.target.value)}
            />
            <select
              className={inputClass}
              value={gradient}
              onChange={(e) => setGradient(e.target.value)}
            >
              {TEAM_GRADIENTS.map((option) => (
                <option key={option} value={option} className="bg-ink">
                  {option.replace("from-", "").replace(" to-", " → ")}
                </option>
              ))}
            </select>
            <textarea
              className={inputClass}
              rows={4}
              placeholder="Short bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>

          {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
          {message && <p className="mt-3 text-sm text-emerald-300">{message}</p>}

          <div className="mt-5 flex gap-3">
            <button
              onClick={save}
              disabled={saving}
              className="rounded-xl bg-gradient-to-r from-violet-600 to-sky-500 px-5 py-2.5 text-sm font-semibold shadow-glow transition-all hover:scale-[1.02] disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save profile"}
            </button>
            <Link
              href="/team"
              className="rounded-xl bg-white/5 px-5 py-2.5 text-sm font-semibold text-mist transition-colors hover:bg-white/10 hover:text-white"
            >
              View team page
            </Link>
            <button
              onClick={() => supabaseBrowser.auth.signOut()}
              className="ml-auto rounded-xl bg-white/5 px-5 py-2.5 text-sm font-semibold text-mist transition-colors hover:bg-white/10 hover:text-white"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
