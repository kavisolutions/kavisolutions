"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { supabaseBrowser, useAuth } from "@/lib/auth-context";
import { getInitials, TEAM_GRADIENTS, type TeamMember } from "@/lib/team";

type AdminEntry = { email: string; source: "env" | "db" };

type MemberDraft = {
  id?: string;
  name: string;
  role: string;
  bio: string;
  profileUrl: string;
  gradient: string;
  sortOrder: number;
  imageUrl: string;
  email: string;
  password: string;
};

const emptyDraft = (): MemberDraft => ({
  name: "",
  role: "",
  bio: "",
  profileUrl: "",
  gradient: TEAM_GRADIENTS[0],
  sortOrder: 0,
  imageUrl: "",
  email: "",
  password: "",
});

const inputClass =
  "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none transition-colors placeholder:text-fog focus:border-violet-400/60";

async function authHeaders(): Promise<Record<string, string>> {
  const { data } = await supabaseBrowser.auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function AdminPage() {
  const { session, loading: authLoading } = useAuth();

  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [tab, setTab] = useState<"team" | "admins" | "settings">("team");

  const [members, setMembers] = useState<TeamMember[]>([]);
  const [admins, setAdmins] = useState<AdminEntry[]>([]);
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [contactEmail, setContactEmail] = useState("");

  const [draft, setDraft] = useState<MemberDraft | null>(null);
  const [savingMember, setSavingMember] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formError, setFormError] = useState("");
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [notice, setNotice] = useState("");
  const [actionError, setActionError] = useState("");

  const loadAll = useCallback(async () => {
    const headers = await authHeaders();

    const [teamRes, adminsRes, settingsRes] = await Promise.all([
      fetch("/api/team", { headers }),
      fetch("/api/admins", { headers }),
      fetch("/api/settings", { headers }),
    ]);

    if (teamRes.status === 401 || adminsRes.status === 401) {
      setIsAdmin(false);
      return;
    }

    if (adminsRes.status === 403) {
      setIsAdmin(false);
      return;
    }

    const teamData = await teamRes.json();
    const adminsData = await adminsRes.json();
    const settingsData = await settingsRes.json().catch(() => null);

    setIsAdmin(true);
    setMembers(teamData.members ?? []);
    setTagline(settingsData?.settings?.tagline ?? teamData.settings?.tagline ?? "");
    setDescription(settingsData?.settings?.description ?? teamData.settings?.description ?? "");
    setContactEmail(settingsData?.settings?.contactEmail ?? "");
    setAdmins(adminsData.admins ?? []);
  }, []);

  const initialize = useCallback(
    async (hasSession: boolean) => {
      if (!hasSession) return;

      try {
        await loadAll();
      } catch {
        setIsAdmin(false);
      }
    },
    [loadAll],
  );

  useEffect(() => {
    if (authLoading) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async loader updates state after awaits
    void initialize(Boolean(session));
  }, [authLoading, session, initialize]);

  const saveMember = async () => {
    if (!draft || savingMember) return;
    setSavingMember(true);
    setFormError("");

    const headers = await authHeaders();
    const isEdit = Boolean(draft.id);

    const res = await fetch(isEdit ? `/api/team/${draft.id}` : "/api/team", {
      method: isEdit ? "PATCH" : "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({
        name: draft.name,
        role: draft.role,
        bio: draft.bio,
        profileUrl: draft.profileUrl,
        gradient: draft.gradient,
        sortOrder: draft.sortOrder,
        imageUrl: draft.imageUrl,
        ...(isEdit ? {} : { email: draft.email, password: draft.password }),
      }),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      setFormError(data?.error || "Failed to save member");
      setSavingMember(false);
      return;
    }

    setNotice(isEdit ? "Member updated" : "Member added");
    setDraft(null);
    setSavingMember(false);
    await loadAll();
  };

  const deleteMember = async (member: TeamMember) => {
    if (!window.confirm(`Remove ${member.name} from the team?`)) return;
    setActionError("");

    const headers = await authHeaders();
    const res = await fetch(`/api/team/${member.id}`, { method: "DELETE", headers });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setActionError(data?.error || "Failed to remove member");
      return;
    }

    setNotice(`${member.name} removed`);
    await loadAll();
  };

  const uploadImage = async (file: File) => {
    if (!draft || uploading) return;
    setUploading(true);
    setFormError("");

    const { data } = await supabaseBrowser.auth.getSession();
    const form = new FormData();
    form.append("file", file);
    form.append("token", data.session?.access_token ?? "");

    const res = await fetch("/api/upload", { method: "POST", body: form });
    const body = await res.json().catch(() => null);

    if (!res.ok) {
      setFormError(body?.error || "Upload failed");
      setUploading(false);
      return;
    }

    setDraft((current) => (current ? { ...current, imageUrl: body.url } : current));
    setUploading(false);
  };

  const addAdmin = async () => {
    if (!newAdminEmail.trim()) return;
    setActionError("");

    const headers = await authHeaders();
    const res = await fetch("/api/admins", {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ email: newAdminEmail }),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      setActionError(data?.error || "Failed to add admin");
      return;
    }

    setNewAdminEmail("");
    setNotice("Admin added");
    await loadAll();
  };

  const removeAdmin = async (email: string) => {
    if (!window.confirm(`Remove admin ${email}?`)) return;
    setActionError("");

    const headers = await authHeaders();
    const res = await fetch(`/api/admins?email=${encodeURIComponent(email)}`, {
      method: "DELETE",
      headers,
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      setActionError(data?.error || "Failed to remove admin");
      return;
    }

    setNotice("Admin removed");
    await loadAll();
  };

  const saveSettings = async () => {
    setActionError("");
    const headers = await authHeaders();
    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ tagline, description, contactEmail }),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      setActionError(data?.error || "Failed to save settings");
      return;
    }

    setNotice("Settings saved");
  };

  useEffect(() => {
    if (!notice) return;
    const timeout = setTimeout(() => setNotice(""), 3000);
    return () => clearTimeout(timeout);
  }, [notice]);

  if (authLoading) {
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
          <h1 className="mb-2 font-display text-2xl font-bold">Admin Panel</h1>
          <p className="mb-6 text-sm text-mist">Sign in with an admin account to continue.</p>
          <Link
            href="/login?next=/admin"
            className="block w-full rounded-xl bg-gradient-to-r from-violet-600 to-sky-500 px-4 py-3 text-sm font-semibold text-white shadow-glow transition-all hover:scale-[1.02]"
          >
            Login
          </Link>
          <Link href="/team" className="mt-4 block text-xs text-mist hover:text-white">
            ← Back to team page
          </Link>
        </div>
      </div>
    );
  }

  if (isAdmin === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink text-white">
        Loading...
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink px-6 text-white">
        <div className="w-full max-w-md rounded-3xl glass p-8 text-center">
          <h1 className="mb-2 font-display text-2xl font-bold">Not authorised</h1>
          <p className="mb-6 text-sm text-mist">
            {session.user.email} is not an admin for this site.
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
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link href="/" className="font-display text-xl font-semibold tracking-tight">
              Kavi<span className="text-gradient">Solutions</span>
            </Link>
            <h1 className="mt-2 font-display text-3xl font-bold">Admin Panel</h1>
            <p className="text-xs text-mist">Signed in as {session.user.email}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/team"
              className="rounded-xl bg-white/5 px-4 py-2 text-xs text-mist transition-colors hover:bg-white/10 hover:text-white"
            >
              View team page
            </Link>
            <button
              onClick={() => supabaseBrowser.auth.signOut()}
              className="rounded-xl bg-white/5 px-4 py-2 text-xs text-mist transition-colors hover:bg-white/10 hover:text-white"
            >
              Sign out
            </button>
          </div>
        </div>

        <div className="mb-6 flex gap-2">
          {(["team", "admins", "settings"] as const).map((key) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`rounded-xl px-4 py-2 text-sm font-semibold capitalize transition-colors ${
                tab === key
                  ? "bg-gradient-to-r from-violet-600 to-sky-500 shadow-glow"
                  : "bg-white/5 text-mist hover:bg-white/10 hover:text-white"
              }`}
            >
              {key}
            </button>
          ))}
        </div>

        {notice && (
          <p className="mb-4 rounded-xl bg-emerald-500/10 px-4 py-2 text-sm text-emerald-300">
            {notice}
          </p>
        )}
        {actionError && (
          <p className="mb-4 rounded-xl bg-red-500/10 px-4 py-2 text-sm text-red-300">
            {actionError}
          </p>
        )}

        {tab === "team" && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setDraft(emptyDraft());
                  setFormError("");
                }}
                className="rounded-xl bg-gradient-to-r from-violet-600 to-sky-500 px-4 py-2 text-sm font-semibold shadow-glow transition-all hover:scale-[1.02]"
              >
                + Add member
              </button>
            </div>

            {draft && (
              <div className="rounded-3xl glass p-6">
                <h2 className="mb-4 font-display text-lg font-semibold">
                  {draft.id ? "Edit member" : "New member"}
                </h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    className={inputClass}
                    placeholder="Name"
                    value={draft.name}
                    onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  />
                  <input
                    className={inputClass}
                    placeholder="Role (e.g. Founder)"
                    value={draft.role}
                    onChange={(e) => setDraft({ ...draft, role: e.target.value })}
                  />
                  <select
                    className={inputClass}
                    value={draft.gradient}
                    onChange={(e) => setDraft({ ...draft, gradient: e.target.value })}
                  >
                    {TEAM_GRADIENTS.map((gradient) => (
                      <option key={gradient} value={gradient} className="bg-ink">
                        {gradient.replace("from-", "").replace(" to-", " → ")}
                      </option>
                    ))}
                  </select>
                  <input
                    className={inputClass}
                    placeholder="Portfolio URL (optional)"
                    value={draft.profileUrl}
                    onChange={(e) => setDraft({ ...draft, profileUrl: e.target.value })}
                  />
                  <input
                    className={inputClass}
                    placeholder="Sort order (lower shows first)"
                    type="number"
                    value={draft.sortOrder}
                    onChange={(e) => setDraft({ ...draft, sortOrder: Number(e.target.value) })}
                  />
                  <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm">
                    <span className="text-mist">{uploading ? "Uploading..." : "Photo"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="text-xs"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) uploadImage(file);
                      }}
                    />
                    {draft.imageUrl && <span className="text-xs text-emerald-300">set</span>}
                  </label>
                  <textarea
                    className={`${inputClass} sm:col-span-2`}
                    placeholder="Short bio"
                    rows={3}
                    value={draft.bio}
                    onChange={(e) => setDraft({ ...draft, bio: e.target.value })}
                  />
                  {!draft.id && (
                    <>
                      <input
                        className={inputClass}
                        placeholder="Login email (optional — links/creates an account)"
                        value={draft.email}
                        onChange={(e) => setDraft({ ...draft, email: e.target.value })}
                      />
                      <input
                        className={inputClass}
                        placeholder="Login password (min 8 chars for new account)"
                        type="password"
                        value={draft.password}
                        onChange={(e) => setDraft({ ...draft, password: e.target.value })}
                      />
                    </>
                  )}
                </div>

                {formError && <p className="mt-3 text-sm text-red-400">{formError}</p>}

                <div className="mt-4 flex gap-3">
                  <button
                    onClick={saveMember}
                    disabled={savingMember}
                    className="rounded-xl bg-gradient-to-r from-violet-600 to-sky-500 px-5 py-2.5 text-sm font-semibold shadow-glow transition-all hover:scale-[1.02] disabled:opacity-60"
                  >
                    {savingMember ? "Saving..." : "Save"}
                  </button>
                  <button
                    onClick={() => setDraft(null)}
                    className="rounded-xl bg-white/5 px-5 py-2.5 text-sm font-semibold text-mist transition-colors hover:bg-white/10 hover:text-white"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="overflow-hidden rounded-3xl glass">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex flex-wrap items-center gap-4 border-b border-white/5 px-6 py-4 last:border-b-0"
                >
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${member.gradient} font-display text-sm font-bold`}
                  >
                    {member.initials || getInitials(member.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{member.name}</p>
                    <p className="text-xs text-mist">
                      {member.role} · order {member.sortOrder}
                      {member.profileUrl ? " · portfolio link" : ""}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        setDraft({
                          id: member.id,
                          name: member.name,
                          role: member.role,
                          bio: member.bio,
                          profileUrl: member.profileUrl ?? "",
                          gradient: member.gradient,
                          sortOrder: member.sortOrder,
                          imageUrl: member.imageUrl ?? "",
                          email: "",
                          password: "",
                        })
                      }
                      className="rounded-lg bg-white/5 px-3 py-1.5 text-xs text-mist transition-colors hover:bg-white/10 hover:text-white"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteMember(member)}
                      className="rounded-lg bg-red-500/10 px-3 py-1.5 text-xs text-red-400 transition-colors hover:bg-red-500/20"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
              {members.length === 0 && (
                <p className="px-6 py-8 text-center text-sm text-mist">No team members yet.</p>
              )}
            </div>
          </div>
        )}

        {tab === "admins" && (
          <div className="space-y-4">
            <div className="rounded-3xl glass p-6">
              <h2 className="mb-4 font-display text-lg font-semibold">Add admin</h2>
              <div className="flex gap-3">
                <input
                  className={inputClass}
                  placeholder="email@example.com"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                />
                <button
                  onClick={addAdmin}
                  className="rounded-xl bg-gradient-to-r from-violet-600 to-sky-500 px-5 py-2.5 text-sm font-semibold shadow-glow transition-all hover:scale-[1.02]"
                >
                  Add
                </button>
              </div>
              <p className="mt-3 text-xs text-mist">
                Admins can manage the team, settings and other admins. The person signs in with
                Google using this email.
              </p>
            </div>

            <div className="overflow-hidden rounded-3xl glass">
              {admins.map((admin) => (
                <div
                  key={admin.email}
                  className="flex items-center justify-between gap-4 border-b border-white/5 px-6 py-4 last:border-b-0"
                >
                  <div>
                    <p className="text-sm font-semibold">{admin.email}</p>
                    <p className="text-xs text-mist">
                      {admin.source === "env" ? "configured on the server" : "added from panel"}
                    </p>
                  </div>
                  {admin.source === "db" && (
                    <button
                      onClick={() => removeAdmin(admin.email)}
                      className="rounded-lg bg-red-500/10 px-3 py-1.5 text-xs text-red-400 transition-colors hover:bg-red-500/20"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "settings" && (
          <div className="rounded-3xl glass p-6">
            <h2 className="mb-4 font-display text-lg font-semibold">Application settings</h2>
            <div className="space-y-3">
              <label className="block text-xs uppercase tracking-widest text-mist">
                Team page tagline
                <input
                  className={`${inputClass} mt-2`}
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="Shown under the team page heading"
                />
              </label>
              <label className="block text-xs uppercase tracking-widest text-mist">
                Team page description
                <textarea
                  className={`${inputClass} mt-2`}
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </label>
              <label className="block text-xs uppercase tracking-widest text-mist">
                Contact form email
                <input
                  className={`${inputClass} mt-2`}
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="Where contact form messages are sent"
                />
              </label>
            </div>
            <button
              onClick={saveSettings}
              className="mt-5 rounded-xl bg-gradient-to-r from-violet-600 to-sky-500 px-5 py-2.5 text-sm font-semibold shadow-glow transition-all hover:scale-[1.02]"
            >
              Save settings
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
