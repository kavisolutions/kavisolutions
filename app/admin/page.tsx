"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { supabaseBrowser, useAuth } from "@/lib/auth-context";
import GradientPicker from "@/components/GradientPicker";
import { getInitials, type OrgRole, type OrgTeam, type TeamMember, type Project, COMMON_SKILLS } from "@/lib/team";

type AdminEntry = { email: string; source: "env" | "db" };

type MemberDraft = {
  id?: string;
  name: string;
  role: string;
  teamId: string;
  bio: string;
  profileUrl: string;
  linkedinUrl: string;
  gradient: string;
  sortOrder: number;
  imageUrl: string;
  email: string;
  password: string;
};

const emptyDraft = (gradient: string): MemberDraft => ({
  name: "",
  role: "",
  teamId: "",
  bio: "",
  profileUrl: "",
  linkedinUrl: "",
  gradient,
  sortOrder: 0,
  imageUrl: "",
  email: "",
  password: "",
});

type ProjectDraft = {
  id?: string;
  name: string;
  description: string;
  liveLink: string;
  liveLinkType: "app" | "web" | "both";
  projectTypes: string[];
  skills: string[];
  sortOrder: number;
};

const emptyProjectDraft = (): ProjectDraft => ({
  name: "",
  description: "",
  liveLink: "",
  liveLinkType: "web",
  projectTypes: [],
  skills: [],
  sortOrder: 0,
});

const inputClass =
  "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none transition-colors placeholder:text-fog focus:border-violet-400/60";

const sections = [
  { key: "team", label: "Team" },
  { key: "roles", label: "Roles" },
  { key: "teams", label: "Teams" },
  { key: "projects", label: "Projects" },
  { key: "admins", label: "Admins" },
  { key: "settings", label: "Settings" },
] as const;

type SectionKey = (typeof sections)[number]["key"];

async function authHeaders(): Promise<Record<string, string>> {
  const { data } = await supabaseBrowser.auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function AdminPage() {
  const { session, loading: authLoading } = useAuth();

  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [section, setSection] = useState<SectionKey>("team");

  const [members, setMembers] = useState<TeamMember[]>([]);
  const [roles, setRoles] = useState<OrgRole[]>([]);
  const [orgTeams, setOrgTeams] = useState<OrgTeam[]>([]);
  const [admins, setAdmins] = useState<AdminEntry[]>([]);
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [contactEmail, setContactEmail] = useState("");

  const [projects, setProjects] = useState<Project[]>([]);
  const [projectDraft, setProjectDraft] = useState<ProjectDraft | null>(null);

  const [draft, setDraft] = useState<MemberDraft | null>(null);
  const [savingMember, setSavingMember] = useState(false);
  const [savingProject, setSavingProject] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formError, setFormError] = useState("");
  const [projectFormError, setProjectFormError] = useState("");

  const [newRoleName, setNewRoleName] = useState("");
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [editingRoleName, setEditingRoleName] = useState("");

  const [newTeamName, setNewTeamName] = useState("");
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [editingTeamName, setEditingTeamName] = useState("");

  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [notice, setNotice] = useState("");
  const [actionError, setActionError] = useState("");
  const [preview, setPreview] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    const headers = await authHeaders();

    const [teamRes, adminsRes, settingsRes, projectsRes] = await Promise.all([
      fetch("/api/team", { headers }),
      fetch("/api/admins", { headers }),
      fetch("/api/settings", { headers }),
      fetch("/api/projects", { headers }),
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
    const projectsData = await projectsRes.json().catch(() => null);

    setIsAdmin(true);
    setMembers(teamData.members ?? []);
    setRoles(teamData.roles ?? []);
    setOrgTeams(teamData.teams ?? []);
    setAdmins(adminsData.admins ?? []);
    setProjects(projectsData?.projects ?? []);
    setTagline(settingsData?.settings?.tagline ?? "");
    setDescription(settingsData?.settings?.description ?? "");
    setContactEmail(settingsData?.settings?.contactEmail ?? "");
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

  useEffect(() => {
    if (!notice) return;
    const timeout = setTimeout(() => setNotice(""), 3000);
    return () => clearTimeout(timeout);
  }, [notice]);

  useEffect(() => {
    if (!draft) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [draft]);

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
        teamId: draft.teamId || null,
        bio: draft.bio,
        profileUrl: draft.profileUrl,
        linkedinUrl: draft.linkedinUrl,
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

  const saveProject = async () => {
    if (!projectDraft || savingProject) return;
    setSavingProject(true);
    setProjectFormError("");

    const headers = await authHeaders();
    const isEdit = Boolean(projectDraft.id);

    const res = await fetch(isEdit ? `/api/projects/${projectDraft.id}` : "/api/projects", {
      method: isEdit ? "PATCH" : "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({
        name: projectDraft.name,
        description: projectDraft.description,
        liveLink: projectDraft.liveLink,
        liveLinkType: projectDraft.liveLinkType,
        projectTypes: projectDraft.projectTypes,
        skills: projectDraft.skills,
        sortOrder: projectDraft.sortOrder,
        ...(isEdit ? { id: projectDraft.id } : {}),
      }),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      setProjectFormError(data?.error || "Failed to save project");
      setSavingProject(false);
      return;
    }

    setNotice(isEdit ? "Project updated" : "Project added");
    setProjectDraft(null);
    setSavingProject(false);
    await loadAll();
  };

  const deleteProject = async (project: Project) => {
    if (!window.confirm(`Delete project "${project.name}"?`)) return;
    setActionError("");

    const headers = await authHeaders();
    const res = await fetch(`/api/projects?id=${project.id}`, { method: "DELETE", headers });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setActionError(data?.error || "Failed to delete project");
      return;
    }

    setNotice(`Project "${project.name}" deleted`);
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

  const addRole = async () => {
    if (!newRoleName.trim()) return;
    setActionError("");

    const headers = await authHeaders();
    const res = await fetch("/api/roles", {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ name: newRoleName }),
    });
    const data = await res.json().catch(() => null);

    if (!res.ok) {
      setActionError(data?.error || "Failed to add role");
      return;
    }

    setNewRoleName("");
    setNotice("Role added");
    await loadAll();
  };

  const renameRole = async (role: OrgRole) => {
    if (!editingRoleName.trim()) return;
    setActionError("");

    const headers = await authHeaders();
    const res = await fetch(`/api/roles/${role.id}`, {
      method: "PATCH",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ name: editingRoleName }),
    });
    const data = await res.json().catch(() => null);

    if (!res.ok) {
      setActionError(data?.error || "Failed to rename role");
      return;
    }

    setEditingRoleId(null);
    setNotice("Role renamed");
    await loadAll();
  };

  const deleteRole = async (role: OrgRole) => {
    if (!window.confirm(`Delete role "${role.name}"? Members with this role will have it cleared.`)) return;
    setActionError("");

    const headers = await authHeaders();
    const res = await fetch(`/api/roles/${role.id}`, { method: "DELETE", headers });
    const data = await res.json().catch(() => null);

    if (!res.ok) {
      setActionError(data?.error || "Failed to delete role");
      return;
    }

    setNotice("Role deleted");
    await loadAll();
  };

  const addOrgTeam = async () => {
    if (!newTeamName.trim()) return;
    setActionError("");

    const headers = await authHeaders();
    const res = await fetch("/api/teams", {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ name: newTeamName }),
    });
    const data = await res.json().catch(() => null);

    if (!res.ok) {
      setActionError(data?.error || "Failed to add team");
      return;
    }

    setNewTeamName("");
    setNotice("Team added");
    await loadAll();
  };

  const renameOrgTeam = async (team: OrgTeam) => {
    if (!editingTeamName.trim()) return;
    setActionError("");

    const headers = await authHeaders();
    const res = await fetch(`/api/teams/${team.id}`, {
      method: "PATCH",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ name: editingTeamName }),
    });
    const data = await res.json().catch(() => null);

    if (!res.ok) {
      setActionError(data?.error || "Failed to rename team");
      return;
    }

    setEditingTeamId(null);
    setNotice("Team renamed");
    await loadAll();
  };

  const deleteOrgTeam = async (team: OrgTeam) => {
    if (!window.confirm(`Delete team "${team.name}"? Members will be unassigned.`)) return;
    setActionError("");

    const headers = await authHeaders();
    const res = await fetch(`/api/teams/${team.id}`, { method: "DELETE", headers });
    const data = await res.json().catch(() => null);

    if (!res.ok) {
      setActionError(data?.error || "Failed to delete team");
      return;
    }

    setNotice("Team deleted");
    await loadAll();
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
    <div className="min-h-screen bg-ink px-4 py-8 text-white sm:px-6 sm:py-12">
      <div className="mx-auto max-w-6xl">
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

        <div className="grid gap-6 md:grid-cols-[220px_1fr]">
          <aside className="flex h-max gap-1 overflow-x-auto rounded-2xl glass p-3 md:flex-col md:overflow-visible">
            {sections.map((item) => (
              <button
                key={item.key}
                onClick={() => setSection(item.key)}
                className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-left text-sm font-semibold transition-colors ${
                  section === item.key
                    ? "bg-gradient-to-r from-violet-600 to-sky-500 shadow-glow"
                    : "text-mist hover:bg-white/5 hover:text-white"
                }`}
              >
                {item.label}
              </button>
            ))}
          </aside>

          <div className="min-w-0">
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

            {section === "team" && (
              <div className="space-y-4">
                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      setDraft(emptyDraft(members[0]?.gradient ?? "from-violet-500 to-purple-500"));
                      setFormError("");
                    }}
                    className="rounded-xl bg-gradient-to-r from-violet-600 to-sky-500 px-4 py-2 text-sm font-semibold shadow-glow transition-all hover:scale-[1.02]"
                  >
                    + Add member
                  </button>
                </div>

                {draft && (
                  <div className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-[#000000b3] p-4 py-10">
                    <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-[#0b0b14] p-6 shadow-2xl">
                      <div className="mb-5 flex items-center justify-between">
                        <h2 className="font-display text-lg font-semibold">
                          {draft.id ? "Edit member" : "New member"}
                        </h2>
                        <button
                          onClick={() => setDraft(null)}
                          className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-lg text-mist transition-colors hover:bg-white/10 hover:text-white"
                          aria-label="Close"
                        >
                          ✕
                        </button>
                      </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <input
                        className={inputClass}
                        placeholder="Name"
                        value={draft.name}
                        onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                      />
                      <select
                        className={inputClass}
                        value={draft.role}
                        onChange={(e) => setDraft({ ...draft, role: e.target.value })}
                      >
                        <option value="" className="bg-ink">
                          No role yet
                        </option>
                        {roles.map((role) => (
                          <option key={role.id} value={role.name} className="bg-ink">
                            {role.name}
                          </option>
                        ))}
                        {draft.role && !roles.some((r) => r.name === draft.role) && (
                          <option value={draft.role} className="bg-ink">
                            {draft.role}
                          </option>
                        )}
                      </select>
                      <select
                        className={inputClass}
                        value={draft.teamId}
                        onChange={(e) => setDraft({ ...draft, teamId: e.target.value })}
                      >
                        <option value="" className="bg-ink">
                          No team
                        </option>
                        {orgTeams.map((team) => (
                          <option key={team.id} value={team.id} className="bg-ink">
                            {team.name}
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
                        placeholder="LinkedIn URL (optional)"
                        value={draft.linkedinUrl}
                        onChange={(e) => setDraft({ ...draft, linkedinUrl: e.target.value })}
                      />
                      <input
                        className={inputClass}
                        placeholder="Sort order (lower shows first)"
                        type="number"
                        value={draft.sortOrder}
                        onChange={(e) => setDraft({ ...draft, sortOrder: Number(e.target.value) })}
                      />
                      <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5">
                        {draft.imageUrl ? (
                          <button
                            type="button"
                            onClick={() => setPreview(draft.imageUrl)}
                            className="shrink-0"
                            title="Preview photo"
                          >
                            <img
                              src={draft.imageUrl}
                              alt="Member photo"
                              className="h-12 w-12 rounded-xl object-cover ring-1 ring-white/20 transition-transform hover:scale-105"
                            />
                          </button>
                        ) : (
                          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/5 text-[10px] text-fog">
                            no photo
                          </span>
                        )}
                        <div className="flex min-w-0 flex-col gap-1">
                          <label className="cursor-pointer text-xs font-semibold text-mist transition-colors hover:text-white">
                            {uploading ? "Uploading..." : draft.imageUrl ? "Change photo" : "Upload photo"}
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
                          {draft.imageUrl && (
                            <div className="flex gap-3 text-[11px]">
                              <button
                                type="button"
                                onClick={() => setPreview(draft.imageUrl)}
                                className="text-sky-300 hover:text-sky-200"
                              >
                                Preview
                              </button>
                              <button
                                type="button"
                                onClick={() => setDraft({ ...draft, imageUrl: "" })}
                                className="text-red-400 hover:text-red-300"
                              >
                                Remove
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="sm:col-span-2">
                        <p className="mb-2 text-xs uppercase tracking-widest text-mist">
                          Card colour
                        </p>
                        <GradientPicker
                          value={draft.gradient}
                          onChange={(gradient) => setDraft({ ...draft, gradient })}
                        />
                      </div>
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
                  </div>
                )}

                <div className="overflow-hidden rounded-3xl glass">
                  <div className="hidden grid-cols-[1.6fr_1fr_1fr_0.5fr_auto] gap-3 border-b border-white/10 px-6 py-3 text-xs uppercase tracking-widest text-fog sm:grid">
                    <span>Member</span>
                    <span>Role</span>
                    <span>Team</span>
                    <span>Order</span>
                    <span />
                  </div>
                  {members.map((member) => (
                    <div
                      key={member.id}
                      className="grid grid-cols-1 gap-3 border-b border-white/5 px-6 py-4 last:border-b-0 sm:grid-cols-[1.6fr_1fr_1fr_0.5fr_auto] sm:items-center"
                    >
                      <div className="flex items-center gap-3">
                        {member.imageUrl ? (
                          <button
                            type="button"
                            onClick={() => setPreview(member.imageUrl)}
                            className="shrink-0"
                            title="Preview photo"
                          >
                            <img
                              src={member.imageUrl}
                              alt={member.name}
                              className="h-10 w-10 rounded-xl object-cover ring-1 ring-white/10 transition-transform hover:scale-105"
                            />
                          </button>
                        ) : (
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${member.gradient} font-display text-xs font-bold`}
                          >
                            {member.initials || getInitials(member.name)}
                          </div>
                        )}
                        <span className="font-semibold">{member.name}</span>
                        {member.linkedinUrl && (
                          <span className="rounded bg-[#0a66c2]/25 px-1.5 py-0.5 text-[10px] font-bold text-sky-300">
                            in
                          </span>
                        )}
                        {member.profileUrl && (
                          <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-bold text-mist">
                            portfolio
                          </span>
                        )}
                      </div>
                      <div>
                        {member.role ? (
                          <span className="inline-block rounded-lg bg-violet-500/15 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-violet-300">
                            {member.role}
                          </span>
                        ) : (
                          <span className="text-xs text-fog">No role</span>
                        )}
                      </div>
                      <div>
                        {member.teamName ? (
                          <span className="inline-block rounded-lg bg-sky-500/15 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-sky-300">
                            {member.teamName}
                          </span>
                        ) : (
                          <span className="text-xs text-fog">No team</span>
                        )}
                      </div>
                      <span className="text-xs text-mist">{member.sortOrder}</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            setDraft({
                              id: member.id,
                              name: member.name,
                              role: member.role,
                              teamId: member.teamId ?? "",
                              bio: member.bio,
                              profileUrl: member.profileUrl ?? "",
                              linkedinUrl: member.linkedinUrl ?? "",
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

            {section === "roles" && (
              <div className="space-y-4">
                <div className="rounded-3xl glass p-6">
                  <h2 className="mb-4 font-display text-lg font-semibold">Add role</h2>
                  <div className="flex gap-3">
                    <input
                      className={inputClass}
                      placeholder="Role name (e.g. Advisor)"
                      value={newRoleName}
                      onChange={(e) => setNewRoleName(e.target.value)}
                    />
                    <button
                      onClick={addRole}
                      className="rounded-xl bg-gradient-to-r from-violet-600 to-sky-500 px-5 py-2.5 text-sm font-semibold shadow-glow transition-all hover:scale-[1.02]"
                    >
                      Add
                    </button>
                  </div>
                </div>

                <div className="overflow-hidden rounded-3xl glass">
                  {roles.map((role) => (
                    <div
                      key={role.id}
                      className="flex flex-wrap items-center gap-3 border-b border-white/5 px-6 py-4 last:border-b-0"
                    >
                      {editingRoleId === role.id ? (
                        <>
                          <input
                            className={`${inputClass} max-w-xs`}
                            value={editingRoleName}
                            onChange={(e) => setEditingRoleName(e.target.value)}
                          />
                          <button
                            onClick={() => renameRole(role)}
                            className="rounded-lg bg-gradient-to-r from-violet-600 to-sky-500 px-3 py-1.5 text-xs font-semibold"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingRoleId(null)}
                            className="rounded-lg bg-white/5 px-3 py-1.5 text-xs text-mist hover:bg-white/10"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <span className="inline-block rounded-lg bg-violet-500/15 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-violet-300">
                            {role.name}
                          </span>
                          <span className="text-xs text-fog">id: {role.id}</span>
                          <div className="ml-auto flex gap-2">
                            <button
                              onClick={() => {
                                setEditingRoleId(role.id);
                                setEditingRoleName(role.name);
                              }}
                              className="rounded-lg bg-white/5 px-3 py-1.5 text-xs text-mist transition-colors hover:bg-white/10 hover:text-white"
                            >
                              Rename
                            </button>
                            <button
                              onClick={() => deleteRole(role)}
                              className="rounded-lg bg-red-500/10 px-3 py-1.5 text-xs text-red-400 transition-colors hover:bg-red-500/20"
                            >
                              Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                  {roles.length === 0 && (
                    <p className="px-6 py-8 text-center text-sm text-mist">No roles yet.</p>
                  )}
                </div>
              </div>
            )}

            {section === "teams" && (
              <div className="space-y-4">
                <div className="rounded-3xl glass p-6">
                  <h2 className="mb-4 font-display text-lg font-semibold">Add team</h2>
                  <div className="flex gap-3">
                    <input
                      className={inputClass}
                      placeholder="Team name (e.g. Design Team)"
                      value={newTeamName}
                      onChange={(e) => setNewTeamName(e.target.value)}
                    />
                    <button
                      onClick={addOrgTeam}
                      className="rounded-xl bg-gradient-to-r from-violet-600 to-sky-500 px-5 py-2.5 text-sm font-semibold shadow-glow transition-all hover:scale-[1.02]"
                    >
                      Add
                    </button>
                  </div>
                </div>

                <div className="overflow-hidden rounded-3xl glass">
                  {orgTeams.map((team) => (
                    <div
                      key={team.id}
                      className="flex flex-wrap items-center gap-3 border-b border-white/5 px-6 py-4 last:border-b-0"
                    >
                      {editingTeamId === team.id ? (
                        <>
                          <input
                            className={`${inputClass} max-w-xs`}
                            value={editingTeamName}
                            onChange={(e) => setEditingTeamName(e.target.value)}
                          />
                          <button
                            onClick={() => renameOrgTeam(team)}
                            className="rounded-lg bg-gradient-to-r from-violet-600 to-sky-500 px-3 py-1.5 text-xs font-semibold"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingTeamId(null)}
                            className="rounded-lg bg-white/5 px-3 py-1.5 text-xs text-mist hover:bg-white/10"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <span className="inline-block rounded-lg bg-sky-500/15 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-sky-300">
                            {team.name}
                          </span>
                          <span className="text-xs text-fog">
                            {members.filter((m) => m.teamId === team.id).length} members
                          </span>
                          <div className="ml-auto flex gap-2">
                            <button
                              onClick={() => {
                                setEditingTeamId(team.id);
                                setEditingTeamName(team.name);
                              }}
                              className="rounded-lg bg-white/5 px-3 py-1.5 text-xs text-mist transition-colors hover:bg-white/10 hover:text-white"
                            >
                              Rename
                            </button>
                            <button
                              onClick={() => deleteOrgTeam(team)}
                              className="rounded-lg bg-red-500/10 px-3 py-1.5 text-xs text-red-400 transition-colors hover:bg-red-500/20"
                            >
                              Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
{orgTeams.length === 0 && (
                      <p className="px-6 py-8 text-center text-sm text-mist">No teams yet.</p>
                    )}
                  </div>
                </div>
              )}

            {section === "projects" && (
              <div className="space-y-4">
                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      setProjectDraft(emptyProjectDraft());
                      setProjectFormError("");
                    }}
                    className="rounded-xl bg-gradient-to-r from-violet-600 to-sky-500 px-4 py-2 text-sm font-semibold shadow-glow transition-all hover:scale-[1.02]"
                  >
                    + Add project
                  </button>
                </div>

                {projectDraft && (
                  <div className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-[#000000b3] p-4 py-10">
                    <div className="w-full max-w-3xl rounded-3xl border border-white/10 bg-[#0b0b14] p-6 shadow-2xl">
                      <div className="mb-5 flex items-center justify-between">
                        <h2 className="font-display text-lg font-semibold">
                          {projectDraft.id ? "Edit project" : "New project"}
                        </h2>
                        <button
                          onClick={() => setProjectDraft(null)}
                          className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-lg text-mist transition-colors hover:bg-white/10 hover:text-white"
                          aria-label="Close"
                        >
                          ✕
                        </button>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <input
                          className={inputClass}
                          placeholder="Project name"
                          value={projectDraft.name}
                          onChange={(e) => setProjectDraft({ ...projectDraft, name: e.target.value })}
                        />
                        <select
                          className={inputClass}
                          value={projectDraft.liveLinkType}
                          onChange={(e) => setProjectDraft({ ...projectDraft, liveLinkType: e.target.value as "app" | "web" | "both" })}
                        >
                          <option value="app" className="bg-ink">App</option>
                          <option value="web" className="bg-ink">Web</option>
                          <option value="both" className="bg-ink">Both</option>
                        </select>
                        <input
                          className={inputClass}
                          placeholder="Live link (optional)"
                          value={projectDraft.liveLink}
                          onChange={(e) => setProjectDraft({ ...projectDraft, liveLink: e.target.value })}
                        />
                        <input
                          className={inputClass}
                          placeholder="Sort order (lower shows first)"
                          type="number"
                          value={projectDraft.sortOrder}
                          onChange={(e) => setProjectDraft({ ...projectDraft, sortOrder: Number(e.target.value) })}
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <p className="mb-2 text-xs uppercase tracking-widest text-mist">
                          Description
                        </p>
                        <textarea
                          className={inputClass}
                          placeholder="Project description"
                          rows={3}
                          value={projectDraft.description}
                          onChange={(e) => setProjectDraft({ ...projectDraft, description: e.target.value })}
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <p className="mb-2 text-xs uppercase tracking-widest text-mist">
                          Project types (multi-select)
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {["App", "Web"].map((type) => (
                            <label
                              key={type}
                              className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm cursor-pointer transition-colors ${
                                projectDraft.projectTypes.includes(type)
                                  ? "bg-violet-500/20 border border-violet-500/40 text-violet-300"
                                  : "bg-white/5 border border-white/10 text-mist hover:bg-white/10 hover:text-white"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={projectDraft.projectTypes.includes(type)}
                                onChange={(e) =>
                                  setProjectDraft({
                                    ...projectDraft,
                                    projectTypes: e.target.checked
                                      ? [...projectDraft.projectTypes, type]
                                      : projectDraft.projectTypes.filter((t) => t !== type),
                                  })
                                }
                                className="w-4 h-4 rounded border-white/20 text-violet-500 focus:ring-violet-500"
                              />
                              {type}
                            </label>
                          ))}
                        </div>
                      </div>
                      <div className="sm:col-span-2">
                        <p className="mb-2 text-xs uppercase tracking-widest text-mist">
                          Skills
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {COMMON_SKILLS.map((skill) => (
                            <label
                              key={skill}
                              className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm cursor-pointer transition-colors ${
                                projectDraft.skills.includes(skill)
                                  ? "bg-sky-500/20 border border-sky-500/40 text-sky-300"
                                  : "bg-white/5 border border-white/10 text-mist hover:bg-white/10 hover:text-white"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={projectDraft.skills.includes(skill)}
                                onChange={(e) =>
                                  setProjectDraft({
                                    ...projectDraft,
                                    skills: e.target.checked
                                      ? [...projectDraft.skills, skill]
                                      : projectDraft.skills.filter((s) => s !== skill),
                                  })
                                }
                                className="w-4 h-4 rounded border-white/20 text-sky-500 focus:ring-sky-500"
                              />
                              {skill}
                            </label>
                          ))}
                        </div>
                      </div>
                      {projectFormError && <p className="mt-3 text-sm text-red-400">{projectFormError}</p>}

                      <div className="mt-4 flex gap-3">
                        <button
                          onClick={saveProject}
                          disabled={savingProject}
                          className="rounded-xl bg-gradient-to-r from-violet-600 to-sky-500 px-5 py-2.5 text-sm font-semibold shadow-glow transition-all hover:scale-[1.02] disabled:opacity-60"
                        >
                          {savingProject ? "Saving..." : "Save"}
                        </button>
                        <button
                          onClick={() => setProjectDraft(null)}
                          className="rounded-xl bg-white/5 px-5 py-2.5 text-sm font-semibold text-mist transition-colors hover:bg-white/10 hover:text-white"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="overflow-hidden rounded-3xl glass">
                  <div className="hidden grid-cols-[2fr_1fr_1fr_0.5fr_auto] gap-3 border-b border-white/10 px-6 py-3 text-xs uppercase tracking-widest text-fog sm:grid">
                    <span>Project</span>
                    <span>Types</span>
                    <span>Live link</span>
                    <span>Order</span>
                    <span />
                  </div>
                  {projects.map((project) => (
                    <div
                      key={project.id}
                      className="grid grid-cols-1 gap-3 border-b border-white/5 px-6 py-4 last:border-b-0 sm:grid-cols-[2fr_1fr_1fr_0.5fr_auto] sm:items-center"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 font-display text-xs font-bold shrink-0">
                          🚀
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold truncate">{project.name}</p>
                          {project.description && (
                            <p className="text-sm text-mist truncate max-w-xs">{project.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {project.projectTypes.map((type) => (
                          <span
                            key={type}
                            className="inline-block rounded-lg bg-sky-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-sky-300"
                          >
                            {type}
                          </span>
                        ))}
                        {project.projectTypes.length === 0 && (
                          <span className="text-[10px] text-fog">No types</span>
                        )}
                      </div>
                      <div>
                        {project.liveLink ? (
                          <a
                            href={project.liveLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-sky-400 hover:text-sky-300 truncate max-w-xs"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                            {project.liveLinkType === "both" ? "App & Web" : project.liveLinkType === "app" ? "App" : "Web"}
                          </a>
                        ) : (
                          <span className="text-xs text-fog">No link</span>
                        )}
                      </div>
                      <span className="text-xs text-mist">{project.sortOrder}</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            setProjectDraft({
                              id: project.id,
                              name: project.name,
                              description: project.description,
                              liveLink: project.liveLink,
                              liveLinkType: project.liveLinkType,
                              projectTypes: project.projectTypes,
                              skills: project.skills,
                              sortOrder: project.sortOrder,
                            })
                          }
                          className="rounded-lg bg-white/5 px-3 py-1.5 text-xs text-mist transition-colors hover:bg-white/10 hover:text-white"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteProject(project)}
                          className="rounded-lg bg-red-500/10 px-3 py-1.5 text-xs text-red-400 transition-colors hover:bg-red-500/20"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                  {projects.length === 0 && (
                    <p className="px-6 py-8 text-center text-sm text-mist">No projects yet.</p>
                  )}
                </div>
              </div>
            )}

            {section === "admins" && (
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
                    Admins can manage the team, roles, teams, settings and other admins. The person
                    signs in with Google or email+password using this email.
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

            {section === "settings" && (
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

        {preview && (
          <div
            className="fixed inset-0 z-[90] flex items-center justify-center bg-[#000000e0] p-6"
            onClick={() => setPreview(null)}
          >
            <div className="flex max-h-full max-w-3xl flex-col items-center gap-4">
              <img
                src={preview}
                alt="Photo preview"
                className="max-h-[80vh] max-w-full rounded-2xl object-contain shadow-2xl"
              />
              <button
                onClick={() => setPreview(null)}
                className="rounded-xl bg-white/10 px-5 py-2 text-sm font-semibold text-mist transition-colors hover:bg-white/20 hover:text-white"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
