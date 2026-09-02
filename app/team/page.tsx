"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

type TeamMember = {
  id: string;
  name: string;
  role: string;
  initials: string;
  gradient: string;
  bio: string;
  image_url: string | null;
  user_id: string | null;
  sort_order: number;
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

export default function TeamManagementPage() {
  const { supabase, session, loading: authLoading } = useAuth();
  const router = useRouter();
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [myProfile, setMyProfile] = useState<TeamMember | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: "",
    role: "",
    bio: "",
    gradient: gradients[0],
    image_url: null as string | null,
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!authLoading && !session) {
      router.push("/login");
    }
  }, [session, authLoading, router]);

  useEffect(() => {
    if (!session) return;

    const fetchData = async () => {
      const res = await fetch("/api/team");
      const data = await res.json();
      setTeam(data);

      const profile = data.find((m: TeamMember) => m.user_id === session.user.id);
      if (profile) {
        setMyProfile(profile);
        setForm({
          name: profile.name,
          role: profile.role,
          bio: profile.bio,
          gradient: profile.gradient,
          image_url: profile.image_url,
        });
      }
      setLoading(false);
    };

    fetchData();
  }, [session]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !session) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("token", session.access_token);

    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();

    if (data.url) {
      setForm((prev) => ({ ...prev, image_url: data.url }));
      // Auto-save the image_url to the profile
      if (myProfile) {
        await fetch("/api/team", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: myProfile.id,
            ...form,
            image_url: data.url,
            initials: getInitials(form.name),
          }),
        });
        const res = await fetch("/api/team");
        const allData = await res.json();
        setTeam(allData);
        const profile = allData.find((m: TeamMember) => m.user_id === session?.user.id);
        if (profile) setMyProfile(profile);
      }
      setMessage("Photo uploaded and saved!");
    } else {
      setMessage(data.error || "Upload failed");
    }
    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!myProfile) return;

    setSaving(true);
    setMessage("");

    await fetch("/api/team", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: myProfile.id,
        ...form,
        initials: getInitials(form.name),
      }),
    });

    setMessage("Profile updated!");
    setSaving(false);

    // Refresh profile data
    const res = await fetch("/api/team");
    const data = await res.json();
    setTeam(data);
    const profile = data.find((m: TeamMember) => m.user_id === session?.user.id);
    if (profile) setMyProfile(profile);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink text-white">
        Loading...
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-ink px-6 py-12 text-white">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Link href="/" className="text-sm text-mist hover:text-white">
              ← Back to site
            </Link>
            <h1 className="mt-2 font-display text-3xl font-bold">My Profile</h1>
            <p className="mt-1 text-sm text-mist">
              Signed in as <span className="text-white">{session.user.email}</span>
            </p>
          </div>
          <button
            onClick={handleSignOut}
            className="rounded-lg bg-white/5 px-4 py-2 text-sm text-mist transition-colors hover:bg-white/10 hover:text-white"
          >
            Sign out
          </button>
        </div>

        {!myProfile ? (
          <div className="rounded-2xl glass p-8 text-center shadow-lift">
            <p className="text-mist">
              Your account is not linked to a team profile yet.
              <br />
              Contact the admin to set up your profile.
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="space-y-4 rounded-2xl glass p-6 shadow-lift"
          >
            {/* Image upload */}
            <div className="flex items-center gap-4">
              <div className="relative">
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
              <div>
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
                  className="rounded-lg bg-white/5 px-4 py-2 text-sm text-mist transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50"
                >
                  {uploading ? "Uploading..." : form.image_url ? "Change photo" : "Upload photo"}
                </button>
                {form.image_url && (
                  <button
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, image_url: null }))}
                    className="ml-2 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400 transition-colors hover:bg-red-500/20"
                  >
                    Remove
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
                Avatar gradient (used when no photo uploaded)
              </label>
              <div className="flex flex-wrap gap-2">
                {gradients.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setForm({ ...form, gradient: g })}
                    className={`h-10 w-10 rounded-xl bg-gradient-to-br ${g} transition-all ${
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
              className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-sky-500 py-3.5 text-sm font-semibold text-white shadow-glow transition-all hover:scale-[1.02] disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save changes"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
