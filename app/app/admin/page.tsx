/* eslint-disable @next/next/no-img-element */
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { authClient, useAuth } from "@/lib/auth-context";
import GradientPicker from "@/components/GradientPicker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getInitials, type OrgRole, type OrgTeam, type TeamMember, type Project, COMMON_SKILLS } from "@/lib/team";
import {
  CERTIFICATE_TYPE_LABELS,
  CERTIFICATE_TYPE_PREFIXES,
  certificateTypeFromId,
  formatCertificateDate,
  formatCertificatePeriod,
  retypeCertificateId,
  type AdminCertificate,
  type CertificateDraft,
  type CertificateType,
} from "@/lib/certificates";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Users,
  BriefcaseBusiness,
  Layers3,
  ShieldCheck,
  Settings2,
  FolderKanban,
  Plus,
  ExternalLink,
  LogOut,
  Search,
  Pencil,
  Trash2,
  Sun,
  Moon,
  X,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Menu,
  Globe,
  Link2,
  Shield,
  Loader2,
  Upload,
  User,
  Award,
  RotateCcw,
  Ban,
} from "lucide-react";

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
  appLink: string;
  webLink: string;
  projectTypes: string[];
  skills: string[];
  sortOrder: number;
};

const emptyProjectDraft = (): ProjectDraft => ({
  name: "",
  description: "",
  appLink: "",
  webLink: "",
  projectTypes: [],
  skills: [],
  sortOrder: 0,
});

const emptyCertificateDraft = (): CertificateDraft => ({
  id: "",
  type: "fellowship",
  recipientName: "",
  programme: "",
  role: "",
  startDate: "",
  endDate: "",
  issuedOn: new Date().toISOString().slice(0, 10),
  summary: "",
});

/* class-validator messages are written for developers. Translate the ones an
   admin can actually hit into something actionable. */
const friendlyCertificateError = (raw: string): string => {
  if (/must match \/\^KV-/.test(raw)) return "Certificate ID must look like KV-FEL-2026-0001.";
  if (/must be a valid ISO 8601 date/.test(raw)) {
    return "That date does not exist. Check the day and month.";
  }
  if (/must be one of the following values/.test(raw)) {
    return "Choose one of the five certificate types.";
  }
  if (/must be a string|should not be empty/.test(raw)) {
    return "Fill in the required fields before saving.";
  }
  return raw;
};

const sections = [
  { key: "team", label: "Team members", icon: Users, description: "Manage your public team directory and member profiles" },
  { key: "roles", label: "Roles", icon: BriefcaseBusiness, description: "Define titles and job responsibilities" },
  { key: "teams", label: "Teams", icon: Layers3, description: "Organize people into functional teams and departments" },
  { key: "projects", label: "Projects", icon: FolderKanban, description: "Manage featured work, tech stacks, and live links" },
  { key: "certificates", label: "Certificates", icon: Award, description: "Issue, revoke and reinstate verifiable certificates" },
  { key: "admins", label: "Administrators", icon: ShieldCheck, description: "Control workspace access and administrative privileges" },
  { key: "settings", label: "Settings", icon: Settings2, description: "Update company profile and public page metadata" },
] as const;

type SectionKey = (typeof sections)[number]["key"];

const withCookies = (extra: RequestInit = {}): RequestInit => ({
  credentials: "include",
  ...extra,
});

export default function AdminPage() {
  const { session, loading: authLoading } = useAuth();

  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [section, setSection] = useState<SectionKey>("team");
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") return "dark";
    const stored = window.localStorage.getItem("kavi-admin-theme");
    return stored === "light" ? "light" : "dark";
  });
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const [members, setMembers] = useState<TeamMember[]>([]);
  const [memberQuery, setMemberQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [teamFilter, setTeamFilter] = useState("all");

  const [roles, setRoles] = useState<OrgRole[]>([]);
  const [orgTeams, setOrgTeams] = useState<OrgTeam[]>([]);
  const [admins, setAdmins] = useState<AdminEntry[]>([]);
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [contactEmail, setContactEmail] = useState("");

  const [projects, setProjects] = useState<Project[]>([]);
  const [projectDraft, setProjectDraft] = useState<ProjectDraft | null>(null);
  const [newSkill, setNewSkill] = useState("");

  const [certificates, setCertificates] = useState<AdminCertificate[]>([]);
  const [certificateDraft, setCertificateDraft] = useState<CertificateDraft | null>(null);
  const [savingCertificate, setSavingCertificate] = useState(false);
  const [certificateError, setCertificateError] = useState("");
  const [certificateQuery, setCertificateQuery] = useState("");
  const [certificateStatusFilter, setCertificateStatusFilter] = useState("all");
  const [revokeTarget, setRevokeTarget] = useState<AdminCertificate | null>(null);
  const [revokeReason, setRevokeReason] = useState("");

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

  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      const matchesQuery = `${member.name} ${member.role} ${member.teamName ?? ""}`
        .toLowerCase()
        .includes(memberQuery.trim().toLowerCase());
      const matchesRole = roleFilter === "all" || (roleFilter === "__unassigned__" ? !member.role : member.role === roleFilter);
      const matchesTeam = teamFilter === "all" || (teamFilter === "__unassigned__" ? !member.teamId : member.teamId === teamFilter);
      return matchesQuery && matchesRole && matchesTeam;
    });
  }, [members, memberQuery, roleFilter, teamFilter]);

  const filteredCertificates = useMemo(() => {
    const query = certificateQuery.trim().toLowerCase();

    return certificates.filter((certificate) => {
      const matchesQuery =
        !query ||
        `${certificate.id} ${certificate.recipient} ${certificate.programme ?? ""} ${certificate.title}`
          .toLowerCase()
          .includes(query);

      const matchesStatus =
        certificateStatusFilter === "all"
          ? // "All statuses" means the live register: deleted rows only show
            // under their own filter, so the default view matches production.
            !certificate.deletedAt
          : certificateStatusFilter === "deleted"
            ? Boolean(certificate.deletedAt)
            : !certificate.deletedAt && certificate.status === certificateStatusFilter;

      return matchesQuery && matchesStatus;
    });
  }, [certificates, certificateQuery, certificateStatusFilter]);

  const deletedCertificateCount = useMemo(
    () => certificates.filter((certificate) => certificate.deletedAt).length,
    [certificates],
  );

  const revokedCertificateCount = useMemo(
    () =>
      certificates.filter((certificate) => !certificate.deletedAt && certificate.status === "revoked")
        .length,
    [certificates],
  );

  const certificateDraftIsRevoked = useMemo(() => {
    if (!certificateDraft) return false;
    const id = certificateDraft.id.trim().toUpperCase();
    return certificates.some(
      (certificate) => certificate.id === id && certificate.status === "revoked",
    );
  }, [certificates, certificateDraft]);

  const certificateDraftIsDeleted = useMemo(() => {
    if (!certificateDraft) return false;
    const id = certificateDraft.id.trim().toUpperCase();
    return certificates.some(
      (certificate) => certificate.id === id && Boolean(certificate.deletedAt),
    );
  }, [certificates, certificateDraft]);

  const loadAll = useCallback(async () => {
    const [teamRes, adminsRes, settingsRes, projectsRes, certificatesRes] = await Promise.all([
      fetch("/api/team", withCookies()),
      fetch("/api/admins", withCookies()),
      fetch("/api/settings", withCookies()),
      fetch("/api/projects", withCookies()),
      fetch("/api/certificates?includeDeleted=true", withCookies()),
    ]);

    if (teamRes.status === 401 || adminsRes.status === 401 || adminsRes.status === 403) {
      setIsAdmin(false);
      return;
    }

    const teamData = await teamRes.json();
    const adminsData = await adminsRes.json();
    const settingsData = await settingsRes.json().catch(() => null);
    const projectsData = await projectsRes.json().catch(() => null);
    const certificatesData = await certificatesRes.json().catch(() => null);

    setIsAdmin(true);
    setMembers(teamData.members ?? []);
    setRoles(teamData.roles ?? []);
    setOrgTeams(teamData.teams ?? []);
    setAdmins(adminsData.admins ?? []);
    setProjects(projectsData?.projects ?? []);
    setCertificates(certificatesData?.certificates ?? []);
    setTagline(settingsData?.settings?.tagline ?? "");
    setDescription(settingsData?.settings?.description ?? "");
    setContactEmail(settingsData?.settings?.contactEmail ?? "");
  }, []);

  const initialize = useCallback(
    async (hasSession: boolean) => {
      if (!hasSession) {
        setIsAdmin(false);
        return;
      }
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
    window.localStorage.setItem("kavi-admin-theme", theme);
    document.documentElement.dataset.theme = theme;
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  useEffect(() => {
    if (!notice) return;
    const timeout = setTimeout(() => setNotice(""), 3500);
    return () => clearTimeout(timeout);
  }, [notice]);

  useEffect(() => {
    if (!draft && !projectDraft && !preview && !certificateDraft && !revokeTarget) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [draft, projectDraft, preview, certificateDraft, revokeTarget]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const s = params.get("section");
    if (s && sections.some((item) => item.key === s)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- sync initial tab from URL before paint
      setSection(s as SectionKey);
    }
  }, []);

  const selectSection = (key: SectionKey) => {
    setSection(key);
    setMobileNavOpen(false);
    const url = new URL(window.location.href);
    url.searchParams.set("section", key);
    window.history.replaceState(null, "", url.toString());
  };

  const saveMember = async () => {
    if (!draft || savingMember) return;
    setSavingMember(true);
    setFormError("");

    const isEdit = Boolean(draft.id);

    const res = await fetch(isEdit ? `/api/team/${draft.id}` : "/api/team", {
      method: isEdit ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
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

    setNotice(isEdit ? "Team member updated successfully" : "New member added to team");
    setDraft(null);
    setSavingMember(false);
    await loadAll();
  };

  const saveProject = async () => {
    if (!projectDraft || savingProject) return;
    setSavingProject(true);
    setProjectFormError("");

    const isEdit = Boolean(projectDraft.id);

    const hasApp = projectDraft.projectTypes.includes("App");
    const hasWeb = projectDraft.projectTypes.includes("Web");
    const liveLinkType = hasApp && hasWeb ? "both" : hasApp ? "app" : "web";

    const res = await fetch(isEdit ? `/api/projects/${projectDraft.id}` : "/api/projects", {
      method: isEdit ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        name: projectDraft.name,
        description: projectDraft.description,
        appLink: projectDraft.appLink,
        webLink: projectDraft.webLink,
        liveLinkType,
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

    setNotice(isEdit ? "Project updated successfully" : "New project added successfully");
    setProjectDraft(null);
    setSavingProject(false);
    await loadAll();
  };

  const deleteProject = async (project: Project) => {
    if (!window.confirm(`Delete project "${project.name}"?`)) return;
    setActionError("");

    const res = await fetch(`/api/projects?id=${project.id}`, { method: "DELETE", credentials: "include" });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setActionError(data?.error || "Failed to delete project");
      return;
    }

    setNotice(`Project "${project.name}" deleted`);
    await loadAll();
  };

  const deleteMember = async (member: TeamMember) => {
    if (!window.confirm(`Remove ${member.name} from the team directory?`)) return;
    setActionError("");

    const res = await fetch(`/api/team/${member.id}`, { method: "DELETE", credentials: "include" });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setActionError(data?.error || "Failed to remove member");
      return;
    }

    setNotice(`${member.name} removed from team`);
    await loadAll();
  };

  const saveCertificate = async () => {
    if (!certificateDraft || savingCertificate) return;
    setSavingCertificate(true);
    setCertificateError("");

    const normalizedId = certificateDraft.id.trim().toUpperCase();
    const isEdit = certificates.some((certificate) => certificate.id === normalizedId);

    if (!/^KV-(FEL|VOL|INT|MEN|EXP)-\d{4}-\d{4}$/.test(normalizedId)) {
      setCertificateError("Certificate ID must look like KV-FEL-2026-0001.");
      setSavingCertificate(false);
      return;
    }

    if (!certificateDraft.recipientName.trim()) {
      setCertificateError("Recipient name is required.");
      setSavingCertificate(false);
      return;
    }

    if (!certificateDraft.issuedOn) {
      setCertificateError("Issue date is required.");
      setSavingCertificate(false);
      return;
    }

    const res = await fetch("/api/certificates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        id: normalizedId,
        type: certificateDraft.type,
        recipientName: certificateDraft.recipientName,
        programme: certificateDraft.programme,
        role: certificateDraft.role,
        startDate: certificateDraft.startDate || undefined,
        endDate: certificateDraft.endDate || undefined,
        issuedOn: certificateDraft.issuedOn,
        summary: certificateDraft.summary,
      }),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      const raw = Array.isArray(data?.message) ? data.message.join(" · ") : data?.message;
      setCertificateError(
        raw ? friendlyCertificateError(raw) : data?.error || "Failed to save certificate",
      );
      setSavingCertificate(false);
      return;
    }

    setNotice(isEdit ? "Certificate record updated" : "Certificate issued and now verifiable");
    setCertificateDraft(null);
    setSavingCertificate(false);
    await loadAll();
  };

  const confirmRevoke = async () => {
    if (!revokeTarget) return;
    setActionError("");

    const res = await fetch("/api/certificates/revoke", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ id: revokeTarget.id, reason: revokeReason }),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      const message = Array.isArray(data?.message) ? data.message.join(" · ") : data?.message;
      setActionError(message ? friendlyCertificateError(message) : "Failed to revoke certificate");
      return;
    }

    setRevokeTarget(null);
    setRevokeReason("");
    setNotice(`${revokeTarget.id} revoked — public verification now shows it as invalid`);
    await loadAll();
  };

  const reinstateCertificate = async (certificate: AdminCertificate) => {
    if (
      !window.confirm(
        `Reinstate ${certificate.id}? Public verification will show it as valid again.`,
      )
    ) {
      return;
    }
    setActionError("");

    const res = await fetch("/api/certificates/reinstate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ id: certificate.id }),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      const message = Array.isArray(data?.message) ? data.message.join(" · ") : data?.message;
      setActionError(message ? friendlyCertificateError(message) : "Failed to reinstate certificate");
      return;
    }

    setNotice(`${certificate.id} reinstated — public verification is valid again`);
    await loadAll();
  };

  const deleteCertificate = async (certificate: AdminCertificate) => {
    if (
      !window.confirm(
        `Delete ${certificate.id}? It will stop verifying immediately. The record is kept and can be restored from the Deleted filter.`,
      )
    ) {
      return;
    }
    setActionError("");

    const res = await fetch(`/api/certificates?id=${encodeURIComponent(certificate.id)}`, {
      method: "DELETE",
      credentials: "include",
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      const message = Array.isArray(data?.message) ? data.message.join(" · ") : data?.message;
      setActionError(message ? friendlyCertificateError(message) : "Failed to delete certificate");
      return;
    }

    setNotice(`${certificate.id} deleted — restore it from the Deleted filter if needed`);
    await loadAll();
  };

  const restoreCertificate = async (certificate: AdminCertificate) => {
    setActionError("");

    const res = await fetch("/api/certificates/restore", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ id: certificate.id }),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      const message = Array.isArray(data?.message) ? data.message.join(" · ") : data?.message;
      setActionError(message ? friendlyCertificateError(message) : "Failed to restore certificate");
      return;
    }

    setNotice(`${certificate.id} restored — it verifies again as ${data.status ?? "issued"}`);
    await loadAll();
  };

  const uploadImage = async (file: File) => {
    if (!draft || uploading) return;
    setUploading(true);
    setFormError("");

    const form = new FormData();
    form.append("file", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: form,
      credentials: "include",
    });
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

    const res = await fetch("/api/roles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ name: newRoleName.trim() }),
    });
    const data = await res.json().catch(() => null);

    if (!res.ok) {
      setActionError(data?.error || "Failed to add role");
      return;
    }

    setNewRoleName("");
    setNotice("Role created successfully");
    await loadAll();
  };

  const renameRole = async (role: OrgRole) => {
    if (!editingRoleName.trim()) return;
    setActionError("");

    const res = await fetch(`/api/roles/${role.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ name: editingRoleName.trim() }),
    });
    const data = await res.json().catch(() => null);

    if (!res.ok) {
      setActionError(data?.error || "Failed to rename role");
      return;
    }

    setEditingRoleId(null);
    setNotice("Role updated");
    await loadAll();
  };

  const deleteRole = async (role: OrgRole) => {
    if (!window.confirm(`Delete role "${role.name}"? Members with this role will be set to unassigned.`)) return;
    setActionError("");

    const res = await fetch(`/api/roles/${role.id}`, { method: "DELETE", credentials: "include" });
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

    const res = await fetch("/api/teams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ name: newTeamName.trim() }),
    });
    const data = await res.json().catch(() => null);

    if (!res.ok) {
      setActionError(data?.error || "Failed to add team");
      return;
    }

    setNewTeamName("");
    setNotice("Team created successfully");
    await loadAll();
  };

  const renameOrgTeam = async (team: OrgTeam) => {
    if (!editingTeamName.trim()) return;
    setActionError("");

    const res = await fetch(`/api/teams/${team.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ name: editingTeamName.trim() }),
    });
    const data = await res.json().catch(() => null);

    if (!res.ok) {
      setActionError(data?.error || "Failed to rename team");
      return;
    }

    setEditingTeamId(null);
    setNotice("Team updated");
    await loadAll();
  };

  const deleteOrgTeam = async (team: OrgTeam) => {
    if (!window.confirm(`Delete team "${team.name}"? Members will be set to no team.`)) return;
    setActionError("");

    const res = await fetch(`/api/teams/${team.id}`, { method: "DELETE", credentials: "include" });
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

    const res = await fetch("/api/admins", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email: newAdminEmail.trim() }),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      setActionError(data?.error || "Failed to add admin");
      return;
    }

    setNewAdminEmail("");
    setNotice("Administrator access granted");
    await loadAll();
  };

  const removeAdmin = async (email: string) => {
    if (!window.confirm(`Remove admin privileges for ${email}?`)) return;
    setActionError("");

    const res = await fetch(`/api/admins?email=${encodeURIComponent(email)}`, {
      method: "DELETE",
      credentials: "include",
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      setActionError(data?.error || "Failed to remove admin");
      return;
    }

    setNotice("Administrator removed");
    await loadAll();
  };

  const saveSettings = async () => {
    setActionError("");
    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ tagline, description, contactEmail }),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      setActionError(data?.error || "Failed to save settings");
      return;
    }

    setNotice("Settings saved successfully");
  };

  if (authLoading || isAdmin === null) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">Loading workspace…</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 text-foreground">
        <Card className="w-full max-w-md border-border bg-card shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md">
              <span className="font-bold text-lg">K</span>
            </div>
            <CardTitle className="text-2xl font-bold">Admin Portal</CardTitle>
            <CardDescription>Sign in with an authorised administrator account to access this workspace.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link
              href="/login?next=/admin"
              className={`${buttonVariants({ variant: "default", size: "lg" })} w-full font-semibold shadow-sm`}
            >
              Sign In to Continue
            </Link>
            <div className="text-center">
              <Link href="/team" className="text-xs text-muted-foreground transition-colors hover:text-foreground">
                ← Return to public team page
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 text-foreground">
        <Card className="w-full max-w-md border-border bg-card text-center shadow-xl">
          <CardHeader>
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
              <Shield className="h-6 w-6" />
            </div>
            <CardTitle className="text-xl font-bold">Access Denied</CardTitle>
            <CardDescription>
              <strong className="text-foreground">{session.user.email}</strong> is not listed as an administrator for Kavi Solutions.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full" onClick={() => authClient.signOut()}>
              <LogOut className="h-4 w-4" /> Sign out
            </Button>
            <Link href="/team" className="inline-block text-xs text-muted-foreground hover:text-foreground">
              ← Return to public team page
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const activeSection = sections.find((item) => item.key === section) ?? sections[0];
  const userInitial = (session.user.email?.[0] ?? "A").toUpperCase();

  return (
    <div id="admin-app" data-theme={theme} className={`admin-app min-h-screen bg-background text-foreground ${theme === "dark" ? "dark" : ""}`}>
      {/* Mobile Drawer Backdrop */}
      {mobileNavOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-card transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          mobileNavOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Workspace Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-border px-5">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-500 font-bold text-white shadow-sm shadow-blue-500/25 transition-transform group-hover:scale-105">
              <span>K</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight text-foreground leading-none">Kavi Solutions</span>
              <span className="mt-1 flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Admin Console
              </span>
            </div>
          </Link>
          <button
            onClick={() => setMobileNavOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground lg:hidden"
            aria-label="Close navigation"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground/80">
            Workspace
          </p>
          <nav className="flex flex-col gap-1">
            {sections.map((item) => {
              const isActive = section === item.key;
              const count =
                item.key === "team"
                  ? members.length
                  : item.key === "roles"
                  ? roles.length
                  : item.key === "teams"
                  ? orgTeams.length
                  : item.key === "projects"
                  ? projects.length
                  : item.key === "certificates"
                  ? certificates.length
                  : item.key === "admins"
                  ? admins.length
                  : null;

              return (
                <button
                  key={item.key}
                  onClick={() => selectSection(item.key)}
                  aria-current={isActive ? "page" : undefined}
                  className={`group flex items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-all ${
                    isActive
                      ? "bg-primary/10 text-primary border border-primary/20 shadow-xs"
                      : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className={`h-4 w-4 transition-colors ${isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`} />
                    <span>{item.label}</span>
                  </div>
                  {count !== null && (
                    <span
                      className={`rounded-md px-1.5 py-0.5 text-[11px] font-semibold tabular-nums ${
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground group-hover:text-foreground"
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Account / Footer */}
        <div className="border-t border-border p-3">
          <div className="flex items-center justify-between rounded-xl bg-muted/40 p-2.5">
            <div className="flex min-w-0 items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-xs font-bold text-white shadow-xs">
                {userInitial}
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-foreground" title={session.user.email ?? ""}>
                  {session.user.email}
                </p>
                <p className="text-[10px] text-muted-foreground">Administrator</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              title="Sign out"
              onClick={() => authClient.signOut()}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="min-h-screen lg:pl-64">
        {/* Top Sticky Header */}
        <header className="sticky top-0 z-40 border-b border-border bg-card/85 px-4 backdrop-blur-md sm:px-8">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4">
            {/* Mobile Header Elements */}
            <div className="flex items-center gap-3 lg:hidden">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-muted-foreground hover:text-foreground"
                onClick={() => setMobileNavOpen(true)}
                aria-label="Open navigation"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary font-bold text-xs text-primary-foreground">
                  K
                </div>
                <span className="text-sm font-semibold tracking-tight text-foreground">Kavi Solutions</span>
              </div>
            </div>

            {/* Desktop Breadcrumbs */}
            <div className="hidden items-center gap-2 text-xs font-medium text-muted-foreground lg:flex">
              <Link href="/" className="hover:text-foreground transition-colors">Kavi Solutions</Link>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />
              <span>Workspace</span>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />
              <span className="text-foreground font-semibold">{activeSection.label}</span>
            </div>

            {/* Right Header Actions */}
            <div className="ml-auto flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 border-border bg-card text-foreground shadow-xs hover:bg-muted"
                aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
                title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              >
                {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </Button>

              <Link
                href="/team"
                className={`${buttonVariants({ variant: "outline", size: "sm" })} hidden sm:inline-flex gap-1.5 border-border bg-card text-foreground shadow-xs hover:bg-muted`}
              >
                <span>Live team page</span>
                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
              </Link>
            </div>
          </div>
        </header>

        {/* Page Main Content */}
        <main className="mx-auto max-w-6xl px-4 pb-16 pt-8 sm:px-8">
          {/* Section Heading & Primary CTA */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-primary">
                Workspace / Administration
              </p>
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {activeSection.label}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {activeSection.description}
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              {section === "team" && (
                <>
                  <Badge variant="outline" className="h-8 rounded-full border-border bg-muted/50 px-3 text-xs font-semibold text-foreground">
                    {members.length} {members.length === 1 ? "member" : "members"}
                  </Badge>
                  <Button
                    onClick={() => {
                      setDraft(emptyDraft(members[0]?.gradient ?? "from-violet-500 to-purple-500"));
                      setFormError("");
                    }}
                    className="shadow-sm font-semibold"
                  >
                    <Plus className="h-4 w-4 mr-1.5" /> Add member
                  </Button>
                </>
              )}

              {section === "projects" && (
                <>
                  <Badge variant="outline" className="h-8 rounded-full border-border bg-muted/50 px-3 text-xs font-semibold text-foreground">
                    {projects.length} {projects.length === 1 ? "project" : "projects"}
                  </Badge>
                  <Button
                    onClick={() => {
                      setProjectDraft(emptyProjectDraft());
                      setProjectFormError("");
                      setNewSkill("");
                    }}
                    className="shadow-sm font-semibold"
                  >
                    <Plus className="h-4 w-4 mr-1.5" /> Add project
                  </Button>
                </>
              )}

              {section === "certificates" && (
                <>
                  <Badge variant="outline" className="h-8 rounded-full border-border bg-muted/50 px-3 text-xs font-semibold text-foreground">
                    {certificates.length} {certificates.length === 1 ? "certificate" : "certificates"}
                  </Badge>
                  <Button
                    onClick={() => {
                      setCertificateDraft(emptyCertificateDraft());
                      setCertificateError("");
                    }}
                    className="shadow-sm font-semibold"
                  >
                    <Plus className="h-4 w-4 mr-1.5" /> Issue certificate
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Feedback Notices */}
          {notice && (
            <div className="mb-6 flex items-center gap-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{notice}</span>
            </div>
          )}

          {actionError && (
            <div className="mb-6 flex items-center gap-2.5 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{actionError}</span>
            </div>
          )}

          {/* SECTION: TEAM MEMBERS */}
          {section === "team" && (
            <div className="space-y-4">
              {/* Member Edit / Add Modal */}
              {draft && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
                  <div className="relative my-8 w-full max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-2xl sm:p-8">
                    <div className="mb-6 flex items-center justify-between border-b border-border pb-4">
                      <div>
                        <h2 className="text-lg font-bold text-foreground">
                          {draft.id ? "Edit Team Member" : "Add New Team Member"}
                        </h2>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {draft.id ? "Update member profile, team assignment and public visibility." : "Add a team member to showcase on the public website."}
                        </p>
                      </div>
                      <button
                        onClick={() => setDraft(null)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        aria-label="Close modal"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <label className="mb-1.5 block text-xs font-semibold text-foreground">Full Name *</label>
                        <Input
                          placeholder="e.g. Sireesha Busani"
                          value={draft.name}
                          onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                        />
                      </div>

                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-foreground">Role / Title</label>
                        <Select
                          value={draft.role || "__none__"}
                          onValueChange={(value) => setDraft({ ...draft, role: value === "__none__" ? "" : value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__none__">No role assigned</SelectItem>
                            {roles.map((role) => (
                              <SelectItem key={role.id} value={role.name}>
                                {role.name}
                              </SelectItem>
                            ))}
                            {draft.role && !roles.some((r) => r.name === draft.role) && (
                              <SelectItem value={draft.role}>{draft.role}</SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-foreground">Team / Department</label>
                        <Select
                          value={draft.teamId || "__none__"}
                          onValueChange={(value) =>
                            setDraft({ ...draft, teamId: value === "__none__" ? "" : value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select team" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__none__">No team assigned</SelectItem>
                            {orgTeams.map((team) => (
                              <SelectItem key={team.id} value={team.id}>
                                {team.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-foreground">Sort Order</label>
                        <Input
                          type="number"
                          placeholder="0"
                          value={draft.sortOrder}
                          onChange={(e) => setDraft({ ...draft, sortOrder: Number(e.target.value) })}
                        />
                        <p className="mt-1 text-[11px] text-muted-foreground">Lower numbers appear first.</p>
                      </div>

                      {/* Photo Upload & Preview Card */}
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-foreground">Profile Photo</label>
                        <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-2.5">
                          {draft.imageUrl ? (
                            <img
                              src={draft.imageUrl}
                              alt="Member photo"
                              className="h-11 w-11 rounded-full object-cover ring-2 ring-border"
                            />
                          ) : (
                            <div className={`flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-tr ${draft.gradient || "from-blue-600 to-indigo-600"} text-xs font-bold text-white shadow-xs`}>
                              {draft.name ? getInitials(draft.name) : <User className="h-5 w-5" />}
                            </div>
                          )}
                          <div className="flex flex-col gap-1 min-w-0">
                            <label className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-primary hover:underline">
                              <Upload className="h-3 w-3" />
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
                              <div className="flex items-center gap-2 text-[11px]">
                                <button
                                  type="button"
                                  onClick={() => setPreview(draft.imageUrl)}
                                  className="text-muted-foreground hover:text-foreground"
                                >
                                  Preview
                                </button>
                                <span className="text-muted-foreground/40">·</span>
                                <button
                                  type="button"
                                  onClick={() => setDraft({ ...draft, imageUrl: "" })}
                                  className="text-destructive hover:underline"
                                >
                                  Remove
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-foreground">Portfolio URL</label>
                        <Input
                          placeholder="https://..."
                          value={draft.profileUrl}
                          onChange={(e) => setDraft({ ...draft, profileUrl: e.target.value })}
                        />
                      </div>

                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-foreground">LinkedIn URL</label>
                        <Input
                          placeholder="https://linkedin.com/in/..."
                          value={draft.linkedinUrl}
                          onChange={(e) => setDraft({ ...draft, linkedinUrl: e.target.value })}
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="mb-1.5 block text-xs font-semibold text-foreground">Avatar Card Colour Theme</label>
                        <GradientPicker
                          value={draft.gradient}
                          onChange={(gradient) => setDraft({ ...draft, gradient })}
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="mb-1.5 block text-xs font-semibold text-foreground">Bio / About</label>
                        <textarea
                          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          placeholder="Brief biography or description of their role and passions..."
                          rows={3}
                          value={draft.bio}
                          onChange={(e) => setDraft({ ...draft, bio: e.target.value })}
                        />
                      </div>

                      {!draft.id && (
                        <>
                          <div>
                            <label className="mb-1.5 block text-xs font-semibold text-foreground">Login Email (optional)</label>
                            <Input
                              placeholder="colleague@kavisolutions.in"
                              value={draft.email}
                              onChange={(e) => setDraft({ ...draft, email: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="mb-1.5 block text-xs font-semibold text-foreground">Login Password (optional)</label>
                            <Input
                              type="password"
                              placeholder="Minimum 8 characters"
                              value={draft.password}
                              onChange={(e) => setDraft({ ...draft, password: e.target.value })}
                            />
                          </div>
                        </>
                      )}
                    </div>

                    {formError && (
                      <div className="mt-4 flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <span>{formError}</span>
                      </div>
                    )}

                    <div className="mt-6 flex items-center justify-end gap-3 border-t border-border pt-4">
                      <Button variant="outline" onClick={() => setDraft(null)}>
                        Cancel
                      </Button>
                      <Button onClick={saveMember} disabled={savingMember || uploading} className="font-semibold">
                        {savingMember ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…
                          </>
                        ) : (
                          "Save Member"
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Members Table Card */}
              <Card className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
                {/* Search & Filter Toolbar */}
                <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="relative w-full max-w-md">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={memberQuery}
                      onChange={(e) => setMemberQuery(e.target.value)}
                      placeholder="Search members, roles, or teams…"
                      aria-label="Search team members"
                      className="h-9.5 pl-9 pr-8 text-sm"
                    />
                    {memberQuery && (
                      <button
                        onClick={() => setMemberQuery("")}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                      <SelectTrigger className="h-9 w-[130px] sm:w-[150px] text-xs">
                        <SelectValue placeholder="All roles" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All roles</SelectItem>
                        <SelectItem value="__unassigned__">Unassigned</SelectItem>
                        {roles.map((r) => (
                          <SelectItem key={r.id} value={r.name}>
                            {r.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={teamFilter} onValueChange={setTeamFilter}>
                      <SelectTrigger className="h-9 w-[130px] sm:w-[150px] text-xs">
                        <SelectValue placeholder="All teams" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All teams</SelectItem>
                        <SelectItem value="__unassigned__">No team</SelectItem>
                        {orgTeams.map((t) => (
                          <SelectItem key={t.id} value={t.id}>
                            {t.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <span className="text-xs text-muted-foreground whitespace-nowrap pl-1">
                      {filteredMembers.length} of {members.length}
                    </span>
                  </div>
                </div>

                {/* Table Content */}
                <Table>
                  <TableHeader className="bg-muted/40">
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="w-[38%] pl-5 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Member</TableHead>
                      <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Role</TableHead>
                      <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Team</TableHead>
                      <TableHead className="w-20 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Order</TableHead>
                      <TableHead className="w-[140px] pr-5 text-right font-semibold text-xs uppercase tracking-wider text-muted-foreground">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMembers.map((member) => (
                      <TableRow key={member.id} className="border-border hover:bg-muted/30 transition-colors">
                        <TableCell className="pl-5 py-3.5">
                          <div className="flex min-w-[210px] items-center gap-3">
                            {member.imageUrl ? (
                              <button
                                type="button"
                                onClick={() => setPreview(member.imageUrl)}
                                className="relative shrink-0 group"
                                title={`Preview ${member.name}'s photo`}
                              >
                                <img
                                  src={member.imageUrl}
                                  alt={member.name}
                                  className="h-10 w-10 rounded-full object-cover ring-2 ring-border shadow-xs transition-transform group-hover:scale-105"
                                />
                              </button>
                            ) : (
                              <div
                                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr ${
                                  member.gradient || "from-blue-600 to-indigo-600"
                                } text-xs font-bold text-white shadow-xs ring-2 ring-border`}
                              >
                                {member.initials || getInitials(member.name)}
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-foreground text-sm leading-snug">
                                {member.name}
                              </p>
                              {(member.linkedinUrl || member.profileUrl) ? (
                                <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                                  {member.linkedinUrl && (
                                    <a
                                      href={member.linkedinUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="inline-flex items-center gap-1 hover:text-primary transition-colors"
                                    >
                                      <Link2 className="h-3 w-3" />
                                      <span>LinkedIn</span>
                                    </a>
                                  )}
                                  {member.linkedinUrl && member.profileUrl && <span>·</span>}
                                  {member.profileUrl && (
                                    <a
                                      href={member.profileUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="inline-flex items-center gap-1 hover:text-primary transition-colors"
                                    >
                                      <Globe className="h-3 w-3" />
                                      <span>Portfolio</span>
                                    </a>
                                  )}
                                </div>
                              ) : (
                                <span className="text-[11px] text-muted-foreground/60">No links added</span>
                              )}
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="whitespace-nowrap py-3.5">
                          {member.role ? (
                            <span className="inline-flex items-center rounded-full border border-blue-500/25 bg-blue-500/10 px-2.5 py-0.5 text-xs font-medium text-blue-600 dark:text-blue-400">
                              {member.role}
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-md border border-dashed border-border bg-muted/40 px-2 py-0.5 text-xs text-muted-foreground/70">
                              Unassigned
                            </span>
                          )}
                        </TableCell>

                        <TableCell className="whitespace-nowrap py-3.5">
                          {member.teamName ? (
                            <span className="inline-flex items-center rounded-full border border-purple-500/25 bg-purple-500/10 px-2.5 py-0.5 text-xs font-medium text-purple-600 dark:text-purple-400">
                              {member.teamName}
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-md border border-dashed border-border bg-muted/40 px-2 py-0.5 text-xs text-muted-foreground/70">
                              No team
                            </span>
                          )}
                        </TableCell>

                        <TableCell className="py-3.5">
                          <span className="inline-flex h-6 min-w-6 items-center justify-center rounded bg-muted/60 px-1.5 font-mono text-xs font-medium text-foreground">
                            {member.sortOrder}
                          </span>
                        </TableCell>

                        <TableCell className="pr-5 py-3.5 text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                              aria-label={`Edit ${member.name}`}
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
                            >
                              <Pencil className="h-3.5 w-3.5 mr-1" />
                              <span>Edit</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2.5 text-xs font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                              aria-label={`Remove ${member.name}`}
                              onClick={() => deleteMember(member)}
                            >
                              <Trash2 className="h-3.5 w-3.5 mr-1" />
                              <span>Remove</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}

                    {filteredMembers.length === 0 && (
                      <TableRow className="hover:bg-transparent">
                        <TableCell colSpan={5} className="h-36 text-center text-sm text-muted-foreground">
                          <div className="flex flex-col items-center justify-center gap-2">
                            <Search className="h-6 w-6 text-muted-foreground/40" />
                            <p className="font-medium text-foreground">No team members match your criteria</p>
                            <p className="text-xs text-muted-foreground">Try clearing your search query or filters.</p>
                            {(memberQuery || roleFilter !== "all" || teamFilter !== "all") && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="mt-2"
                                onClick={() => {
                                  setMemberQuery("");
                                  setRoleFilter("all");
                                  setTeamFilter("all");
                                }}
                              >
                                Clear all filters
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </Card>
            </div>
          )}

          {/* SECTION: ROLES */}
          {section === "roles" && (
            <div className="space-y-6">
              {/* Add Role Card */}
              <Card className="rounded-xl border border-border bg-card shadow-xs">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-bold">Add Role</CardTitle>
                  <CardDescription>Define role titles and responsibilities for your organisation.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Input
                      placeholder="Role title (e.g. Senior Frontend Engineer, Advisor)"
                      value={newRoleName}
                      onChange={(e) => setNewRoleName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addRole();
                        }
                      }}
                      className="max-w-md"
                    />
                    <Button onClick={addRole} disabled={!newRoleName.trim()} className="font-semibold">
                      <Plus className="h-4 w-4 mr-1.5" /> Add role
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Roles Table */}
              <Card className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
                <div className="border-b border-border px-5 py-3.5 bg-muted/30">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Available Roles ({roles.length})
                  </span>
                </div>
                <div className="divide-y divide-border">
                  {roles.map((role) => {
                    const memberCount = members.filter((m) => m.role === role.name).length;
                    const isEditing = editingRoleId === role.id;

                    return (
                      <div key={role.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 hover:bg-muted/30 transition-colors">
                        {isEditing ? (
                          <div className="flex items-center gap-2 flex-1 max-w-md">
                            <Input
                              value={editingRoleName}
                              onChange={(e) => setEditingRoleName(e.target.value)}
                              className="h-8 text-sm"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === "Enter") renameRole(role);
                                if (e.key === "Escape") setEditingRoleId(null);
                              }}
                            />
                            <Button size="sm" className="h-8 px-3" onClick={() => renameRole(role)}>
                              Save
                            </Button>
                            <Button size="sm" variant="outline" className="h-8 px-3" onClick={() => setEditingRoleId(null)}>
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center gap-3">
                              <span className="inline-flex items-center rounded-full border border-blue-500/25 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400">
                                {role.name}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {memberCount} {memberCount === 1 ? "member" : "members"}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted"
                                onClick={() => {
                                  setEditingRoleId(role.id);
                                  setEditingRoleName(role.name);
                                }}
                              >
                                <Pencil className="h-3.5 w-3.5 mr-1" /> Rename
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2.5 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                onClick={() => deleteRole(role)}
                              >
                                <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                  {roles.length === 0 && (
                    <div className="px-5 py-8 text-center text-sm text-muted-foreground">
                      No roles defined yet. Add your first role above.
                    </div>
                  )}
                </div>
              </Card>
            </div>
          )}

          {/* SECTION: TEAMS */}
          {section === "teams" && (
            <div className="space-y-6">
              {/* Add Team Card */}
              <Card className="rounded-xl border border-border bg-card shadow-xs">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-bold">Add Team</CardTitle>
                  <CardDescription>Organise team members into functional squads or departments.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Input
                      placeholder="Team name (e.g. Design & Creative, Full-Stack Engineering)"
                      value={newTeamName}
                      onChange={(e) => setNewTeamName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addOrgTeam();
                        }
                      }}
                      className="max-w-md"
                    />
                    <Button onClick={addOrgTeam} disabled={!newTeamName.trim()} className="font-semibold">
                      <Plus className="h-4 w-4 mr-1.5" /> Add team
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Teams List */}
              <Card className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
                <div className="border-b border-border px-5 py-3.5 bg-muted/30">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Available Teams ({orgTeams.length})
                  </span>
                </div>
                <div className="divide-y divide-border">
                  {orgTeams.map((team) => {
                    const memberCount = members.filter((m) => m.teamId === team.id).length;
                    const isEditing = editingTeamId === team.id;

                    return (
                      <div key={team.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 hover:bg-muted/30 transition-colors">
                        {isEditing ? (
                          <div className="flex items-center gap-2 flex-1 max-w-md">
                            <Input
                              value={editingTeamName}
                              onChange={(e) => setEditingTeamName(e.target.value)}
                              className="h-8 text-sm"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === "Enter") renameOrgTeam(team);
                                if (e.key === "Escape") setEditingTeamId(null);
                              }}
                            />
                            <Button size="sm" className="h-8 px-3" onClick={() => renameOrgTeam(team)}>
                              Save
                            </Button>
                            <Button size="sm" variant="outline" className="h-8 px-3" onClick={() => setEditingTeamId(null)}>
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center gap-3">
                              <span className="inline-flex items-center rounded-full border border-purple-500/25 bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-600 dark:text-purple-400">
                                {team.name}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {memberCount} {memberCount === 1 ? "member" : "members"}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted"
                                onClick={() => {
                                  setEditingTeamId(team.id);
                                  setEditingTeamName(team.name);
                                }}
                              >
                                <Pencil className="h-3.5 w-3.5 mr-1" /> Rename
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2.5 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                onClick={() => deleteOrgTeam(team)}
                              >
                                <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                  {orgTeams.length === 0 && (
                    <div className="px-5 py-8 text-center text-sm text-muted-foreground">
                      No teams defined yet. Add your first team above.
                    </div>
                  )}
                </div>
              </Card>
            </div>
          )}

          {/* SECTION: PROJECTS */}
          {section === "projects" && (
            <div className="space-y-4">
              {/* Project Modal */}
              {projectDraft && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
                  <div className="relative my-8 w-full max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-2xl sm:p-8">
                    <div className="mb-6 flex items-center justify-between border-b border-border pb-4">
                      <div>
                        <h2 className="text-lg font-bold text-foreground">
                          {projectDraft.id ? "Edit Project" : "Add New Project"}
                        </h2>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Featured work showcase for the public portfolio.
                        </p>
                      </div>
                      <button
                        onClick={() => setProjectDraft(null)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-foreground">Project Name *</label>
                        <Input
                          placeholder="e.g. NextGen FinTech Platform"
                          value={projectDraft.name}
                          onChange={(e) => setProjectDraft({ ...projectDraft, name: e.target.value })}
                        />
                      </div>

                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-foreground">Description</label>
                        <textarea
                          className="flex min-h-[70px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          placeholder="Describe what the product does and key outcomes achieved..."
                          rows={3}
                          value={projectDraft.description}
                          onChange={(e) => setProjectDraft({ ...projectDraft, description: e.target.value })}
                        />
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="mb-1.5 block text-xs font-semibold text-foreground">Project Types</label>
                          <div className="flex gap-2">
                            {["App", "Web"].map((type) => {
                              const active = projectDraft.projectTypes.includes(type);
                              return (
                                <button
                                  key={type}
                                  type="button"
                                  onClick={() =>
                                    setProjectDraft({
                                      ...projectDraft,
                                      projectTypes: active
                                        ? projectDraft.projectTypes.filter((t) => t !== type)
                                        : [...projectDraft.projectTypes, type],
                                    })
                                  }
                                  className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                                    active
                                      ? "border-primary bg-primary/10 text-primary"
                                      : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
                                  }`}
                                >
                                  {type}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div>
                          <label className="mb-1.5 block text-xs font-semibold text-foreground">Sort Order</label>
                          <Input
                            type="number"
                            value={projectDraft.sortOrder}
                            onChange={(e) => setProjectDraft({ ...projectDraft, sortOrder: Number(e.target.value) })}
                          />
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="mb-1.5 block text-xs font-semibold text-foreground">App Link URL</label>
                          <Input
                            placeholder="https://apps.apple.com/..."
                            value={projectDraft.appLink}
                            onChange={(e) => setProjectDraft({ ...projectDraft, appLink: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="mb-1.5 block text-xs font-semibold text-foreground">Web Link URL</label>
                          <Input
                            placeholder="https://mywebsite.com"
                            value={projectDraft.webLink}
                            onChange={(e) => setProjectDraft({ ...projectDraft, webLink: e.target.value })}
                          />
                        </div>
                      </div>

                      {/* Skills Tags */}
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-foreground">Technologies & Skills</label>
                        <div className="mb-2.5 flex gap-2">
                          <Input
                            placeholder="Add a technology or skill…"
                            value={newSkill}
                            onChange={(e) => setNewSkill(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key !== "Enter") return;
                              e.preventDefault();
                              const val = newSkill.trim();
                              if (!val) return;
                              setNewSkill("");
                              setProjectDraft(
                                projectDraft.skills.includes(val)
                                  ? projectDraft
                                  : { ...projectDraft, skills: [...projectDraft.skills, val] },
                              );
                            }}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              const val = newSkill.trim();
                              if (!val) return;
                              setNewSkill("");
                              setProjectDraft(
                                projectDraft.skills.includes(val)
                                  ? projectDraft
                                  : { ...projectDraft, skills: [...projectDraft.skills, val] },
                              );
                            }}
                          >
                            Add
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {Array.from(new Set([...COMMON_SKILLS, ...projectDraft.skills])).map((skill) => {
                            const active = projectDraft.skills.includes(skill);
                            return (
                              <button
                                key={skill}
                                type="button"
                                onClick={() =>
                                  setProjectDraft({
                                    ...projectDraft,
                                    skills: active
                                      ? projectDraft.skills.filter((s) => s !== skill)
                                      : [...projectDraft.skills, skill],
                                  })
                                }
                                className={`rounded-md border px-2.5 py-1 text-xs transition-colors ${
                                  active
                                    ? "border-primary/40 bg-primary/10 text-primary font-semibold"
                                    : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
                                }`}
                              >
                                {skill}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {projectFormError && (
                      <div className="mt-4 flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <span>{projectFormError}</span>
                      </div>
                    )}

                    <div className="mt-6 flex items-center justify-end gap-3 border-t border-border pt-4">
                      <Button variant="outline" onClick={() => setProjectDraft(null)}>
                        Cancel
                      </Button>
                      <Button onClick={saveProject} disabled={savingProject} className="font-semibold">
                        {savingProject ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Save Project
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Projects Table Card */}
              <Card className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/40">
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="w-[35%] pl-5 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Project</TableHead>
                      <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Types</TableHead>
                      <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Links</TableHead>
                      <TableHead className="w-20 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Order</TableHead>
                      <TableHead className="w-[140px] pr-5 text-right font-semibold text-xs uppercase tracking-wider text-muted-foreground">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projects.map((project) => (
                      <TableRow key={project.id} className="border-border hover:bg-muted/30 transition-colors">
                        <TableCell className="pl-5 py-3.5">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 font-bold text-white shadow-xs">
                              🚀
                            </div>
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-foreground text-sm">{project.name}</p>
                              {project.description && (
                                <p className="truncate text-xs text-muted-foreground max-w-sm">{project.description}</p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-3.5">
                          <div className="flex flex-wrap gap-1">
                            {project.projectTypes.map((type) => (
                              <span
                                key={type}
                                className="inline-flex rounded-full border border-sky-500/25 bg-sky-500/10 px-2 py-0.5 text-[10px] font-semibold text-sky-600 dark:text-sky-400"
                              >
                                {type}
                              </span>
                            ))}
                            {project.projectTypes.length === 0 && (
                              <span className="text-xs text-muted-foreground/60">No types</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="py-3.5">
                          <div className="flex flex-col gap-1 text-xs">
                            {project.appLink && (
                              <a
                                href={project.appLink}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 text-primary hover:underline truncate max-w-xs"
                              >
                                <span className="rounded bg-muted px-1 py-0.5 text-[9px] font-bold uppercase text-muted-foreground">App</span>
                                <span className="truncate">{project.appLink}</span>
                              </a>
                            )}
                            {project.webLink && (
                              <a
                                href={project.webLink}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 text-primary hover:underline truncate max-w-xs"
                              >
                                <span className="rounded bg-muted px-1 py-0.5 text-[9px] font-bold uppercase text-muted-foreground">Web</span>
                                <span className="truncate">{project.webLink}</span>
                              </a>
                            )}
                            {!project.appLink && !project.webLink && (
                              <span className="text-xs text-muted-foreground/60">No links</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="py-3.5">
                          <span className="inline-flex h-6 min-w-6 items-center justify-center rounded bg-muted/60 px-1.5 font-mono text-xs font-medium text-foreground">
                            {project.sortOrder}
                          </span>
                        </TableCell>
                        <TableCell className="pr-5 py-3.5 text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
                              onClick={() => {
                                setNewSkill("");
                                setProjectDraft({
                                  id: project.id,
                                  name: project.name,
                                  description: project.description,
                                  appLink: project.appLink,
                                  webLink: project.webLink,
                                  projectTypes: project.projectTypes,
                                  skills: project.skills,
                                  sortOrder: project.sortOrder,
                                });
                              }}
                            >
                              <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2.5 text-xs text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                              onClick={() => deleteProject(project)}
                            >
                              <Trash2 className="h-3.5 w-3.5 mr-1" /> Remove
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {projects.length === 0 && (
                      <TableRow className="hover:bg-transparent">
                        <TableCell colSpan={5} className="h-32 text-center text-sm text-muted-foreground">
                          No featured projects added yet. Click &ldquo;+ Add project&rdquo; to create one.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </Card>
            </div>
          )}

          {/* SECTION: CERTIFICATES */}
          {section === "certificates" && (
            <div className="space-y-4">
              {/* Issue / Edit Certificate Modal */}
              {certificateDraft && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
                  <div className="relative my-8 w-full max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-2xl sm:p-8">
                    <div className="mb-6 flex items-center justify-between border-b border-border pb-4">
                      <div>
                        <h2 className="text-lg font-bold text-foreground">
                          {certificates.some(
                            (certificate) =>
                              certificate.id === certificateDraft.id.trim().toUpperCase(),
                          )
                            ? "Edit Certificate Record"
                            : "Issue New Certificate"}
                        </h2>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Recording a certificate makes it verifiable at /verify/&lt;id&gt;. The printed
                          PDF is still generated separately.
                        </p>
                        {certificateDraftIsDeleted && (
                          <p className="mt-2 rounded-md border border-amber-500/25 bg-amber-500/10 px-2.5 py-1.5 text-[11px] font-medium text-amber-700 dark:text-amber-300">
                            This record is deleted and does not verify. Saving will restore it.
                          </p>
                        )}
                        {!certificateDraftIsDeleted && certificateDraftIsRevoked && (
                          <p className="mt-2 rounded-md border border-amber-500/25 bg-amber-500/10 px-2.5 py-1.5 text-[11px] font-medium text-amber-700 dark:text-amber-300">
                            This record is revoked. Saving edits will not make it valid again — use
                            Reinstate for that.
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => setCertificateDraft(null)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        aria-label="Close modal"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="mb-1.5 block text-xs font-semibold text-foreground">
                            Certificate ID *
                          </label>
                          <Input
                            placeholder="KV-FEL-2026-0001"
                            value={certificateDraft.id}
                            spellCheck={false}
                            className="font-mono uppercase"
                            onChange={(event) => {
                              const id = event.target.value;
                              const derived = certificateTypeFromId(id);
                              setCertificateDraft({
                                ...certificateDraft,
                                id,
                                ...(derived ? { type: derived } : {}),
                              });
                            }}
                          />
                          <p className="mt-1 text-[11px] text-muted-foreground">
                            Must use the prefix for its type:{" "}
                            <span className="font-mono">
                              KV-{CERTIFICATE_TYPE_PREFIXES[certificateDraft.type]}-YYYY-NNNN
                            </span>
                          </p>
                        </div>

                        <div>
                          <label className="mb-1.5 block text-xs font-semibold text-foreground">
                            Certificate Type *
                          </label>
                          <Select
                            value={certificateDraft.type}
                            onValueChange={(value) => {
                              const type = value as CertificateType;
                              setCertificateDraft({
                                ...certificateDraft,
                                type,
                                id: retypeCertificateId(
                                  certificateDraft.id,
                                  CERTIFICATE_TYPE_PREFIXES[type],
                                ),
                              });
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              {(Object.keys(CERTIFICATE_TYPE_LABELS) as CertificateType[]).map((type) => (
                                <SelectItem key={type} value={type}>
                                  {CERTIFICATE_TYPE_LABELS[type]}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-foreground">
                          Recipient Name *
                        </label>
                        <Input
                          placeholder="As printed on the certificate"
                          value={certificateDraft.recipientName}
                          onChange={(event) =>
                            setCertificateDraft({
                              ...certificateDraft,
                              recipientName: event.target.value,
                            })
                          }
                        />
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="mb-1.5 block text-xs font-semibold text-foreground">
                            Programme
                          </label>
                          <Input
                            placeholder="e.g. Kavi Fellows · Cohort 04"
                            value={certificateDraft.programme}
                            onChange={(event) =>
                              setCertificateDraft({
                                ...certificateDraft,
                                programme: event.target.value,
                              })
                            }
                          />
                        </div>
                        <div>
                          <label className="mb-1.5 block text-xs font-semibold text-foreground">
                            Role
                          </label>
                          <Input
                            placeholder="e.g. Software Engineering Intern"
                            value={certificateDraft.role}
                            onChange={(event) =>
                              setCertificateDraft({ ...certificateDraft, role: event.target.value })
                            }
                          />
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-3">
                        <div>
                          <label className="mb-1.5 block text-xs font-semibold text-foreground">
                            Start Date
                          </label>
                          <Input
                            type="date"
                            value={certificateDraft.startDate}
                            onChange={(event) =>
                              setCertificateDraft({
                                ...certificateDraft,
                                startDate: event.target.value,
                              })
                            }
                          />
                        </div>
                        <div>
                          <label className="mb-1.5 block text-xs font-semibold text-foreground">
                            End Date
                          </label>
                          <Input
                            type="date"
                            value={certificateDraft.endDate}
                            onChange={(event) =>
                              setCertificateDraft({
                                ...certificateDraft,
                                endDate: event.target.value,
                              })
                            }
                          />
                        </div>
                        <div>
                          <label className="mb-1.5 block text-xs font-semibold text-foreground">
                            Issued On *
                          </label>
                          <Input
                            type="date"
                            value={certificateDraft.issuedOn}
                            onChange={(event) =>
                              setCertificateDraft({
                                ...certificateDraft,
                                issuedOn: event.target.value,
                              })
                            }
                          />
                        </div>
                      </div>

                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-foreground">
                          Summary
                        </label>
                        <textarea
                          className="flex min-h-[70px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          placeholder="Optional note shown on the verification page."
                          rows={3}
                          value={certificateDraft.summary}
                          onChange={(event) =>
                            setCertificateDraft({
                              ...certificateDraft,
                              summary: event.target.value,
                            })
                          }
                        />
                      </div>
                    </div>

                    {certificateError && (
                      <div className="mt-4 flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <span>{certificateError}</span>
                      </div>
                    )}

                    <div className="mt-6 flex items-center justify-end gap-3 border-t border-border pt-4">
                      <Button variant="outline" onClick={() => setCertificateDraft(null)}>
                        Cancel
                      </Button>
                      <Button
                        onClick={saveCertificate}
                        disabled={savingCertificate}
                        className="font-semibold"
                      >
                        {savingCertificate ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Save Certificate
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Revoke Confirmation Modal */}
              {revokeTarget && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                  <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
                    <div className="mb-4 flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
                        <Ban className="h-5 w-5" />
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-foreground">Revoke certificate</h2>
                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                          <span className="font-mono font-semibold text-foreground">{revokeTarget.id}</span>{" "}
                          will show as invalid on the public verification page, and the recipient
                          name will be hidden.
                        </p>
                      </div>
                    </div>

                    <label className="mb-1.5 block text-xs font-semibold text-foreground">
                      Reason (recorded internally)
                    </label>
                    <Input
                      placeholder="e.g. Issued in error"
                      value={revokeReason}
                      onChange={(event) => setRevokeReason(event.target.value)}
                    />

                    <div className="mt-6 flex items-center justify-end gap-3 border-t border-border pt-4">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setRevokeTarget(null);
                          setRevokeReason("");
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={confirmRevoke}
                        className="bg-destructive font-semibold text-destructive-foreground hover:bg-destructive/90"
                      >
                        <Ban className="mr-2 h-4 w-4" /> Revoke
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Filters */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative flex-1 sm:max-w-sm">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search by ID, recipient or programme…"
                    value={certificateQuery}
                    onChange={(event) => setCertificateQuery(event.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={certificateStatusFilter} onValueChange={setCertificateStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[190px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="issued">Issued only</SelectItem>
                    <SelectItem value="revoked">
                      Revoked only{revokedCertificateCount ? ` (${revokedCertificateCount})` : ""}
                    </SelectItem>
                    <SelectItem value="deleted">
                      Deleted only{deletedCertificateCount ? ` (${deletedCertificateCount})` : ""}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <div className="text-xs text-muted-foreground sm:ml-auto">
                  Showing {filteredCertificates.length} of {certificates.length}
                </div>
              </div>

              {/* Certificates Table Card */}
              <Card className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/40">
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="w-full pl-5 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Certificate</TableHead>
                      <TableHead className="whitespace-nowrap font-semibold text-xs uppercase tracking-wider text-muted-foreground">Recipient</TableHead>
                      <TableHead className="whitespace-nowrap font-semibold text-xs uppercase tracking-wider text-muted-foreground">Issued</TableHead>
                      <TableHead className="whitespace-nowrap font-semibold text-xs uppercase tracking-wider text-muted-foreground">Status</TableHead>
                      <TableHead className="whitespace-nowrap pr-5 text-right font-semibold text-xs uppercase tracking-wider text-muted-foreground">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCertificates.map((certificate) => (
                      <TableRow key={certificate.id} className="border-border hover:bg-muted/30 transition-colors">
                        <TableCell className="pl-5 py-3.5 max-w-0">
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-xs ${
                                certificate.status === "revoked"
                                  ? "bg-gradient-to-br from-rose-600 to-red-700"
                                  : "bg-gradient-to-br from-blue-600 to-indigo-600"
                              }`}
                            >
                              <Award className="h-4 w-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="truncate font-mono text-xs font-semibold text-foreground">
                                {certificate.id}
                              </p>
                              <p className="truncate text-xs text-muted-foreground">
                                {certificate.title}
                                {certificate.programme ? ` · ${certificate.programme}` : ""}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-3.5">
                          <p className="text-sm font-medium text-foreground">{certificate.recipient}</p>
                          {certificate.role && (
                            <p className="text-xs text-muted-foreground">{certificate.role}</p>
                          )}
                        </TableCell>
                        <TableCell className="py-3.5 whitespace-nowrap">
                          <span className="text-xs text-foreground">
                            {formatCertificateDate(certificate.issuedOn)}
                          </span>
                          {(certificate.startDate || certificate.endDate) && (
                            <p className="text-[11px] text-muted-foreground">
                              {formatCertificatePeriod(certificate.startDate, certificate.endDate)}
                            </p>
                          )}
                        </TableCell>
                        <TableCell className="py-3.5">
                          {certificate.deletedAt ? (
                            <div className="space-y-1">
                              <Badge
                                variant="outline"
                                className="border-border bg-muted text-[10px] font-semibold uppercase tracking-wide text-muted-foreground"
                              >
                                Deleted
                              </Badge>
                              <p className="text-[11px] text-muted-foreground">
                                {formatCertificateDate(certificate.deletedAt.slice(0, 10))}
                              </p>
                            </div>
                          ) : certificate.status === "revoked" ? (
                            <div className="space-y-1">
                              <Badge
                                variant="outline"
                                className="border-destructive/30 bg-destructive/10 text-[10px] font-semibold uppercase tracking-wide text-destructive"
                              >
                                Revoked
                              </Badge>
                              {certificate.revokedOn && (
                                <p className="text-[11px] text-muted-foreground">
                                  {formatCertificateDate(certificate.revokedOn)}
                                </p>
                              )}
                            </div>
                          ) : (
                            <Badge
                              variant="outline"
                              className="border-emerald-500/30 bg-emerald-500/10 text-[10px] font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400"
                            >
                              Issued
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="pr-5 py-3.5 text-right">
                          <div className="flex justify-end gap-1 whitespace-nowrap">
                            {!certificate.deletedAt && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
                                title="Open the public verification page"
                                aria-label={`Open the verification page for ${certificate.id}`}
                                onClick={() =>
                                  window.open(
                                    `/verify/${encodeURIComponent(certificate.id)}`,
                                    "_blank",
                                    "noopener",
                                  )
                                }
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
                              title="Edit this record"
                              aria-label={`Edit ${certificate.id}`}
                              onClick={() => {
                                setCertificateError("");
                                setCertificateDraft({
                                  id: certificate.id,
                                  type: certificate.type,
                                  recipientName: certificate.recipient,
                                  programme: certificate.programme ?? "",
                                  role: certificate.role ?? "",
                                  startDate: certificate.startDate ?? "",
                                  endDate: certificate.endDate ?? "",
                                  issuedOn: certificate.issuedOn,
                                  summary: certificate.summary ?? "",
                                });
                              }}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            {certificate.deletedAt ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2 text-xs text-emerald-600 hover:bg-emerald-500/10 hover:text-emerald-600 dark:text-emerald-400"
                                title="Restore this certificate"
                                aria-label={`Restore ${certificate.id}`}
                                onClick={() => restoreCertificate(certificate)}
                              >
                                <RotateCcw className="h-3.5 w-3.5" />
                              </Button>
                            ) : (
                              <>
                                {certificate.status === "revoked" ? (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 px-2.5 text-xs text-emerald-600 hover:bg-emerald-500/10 hover:text-emerald-600 dark:text-emerald-400"
                                    title="Make this certificate valid again"
                                    onClick={() => reinstateCertificate(certificate)}
                                  >
                                    <RotateCcw className="h-3.5 w-3.5 mr-1" /> Reinstate
                                  </Button>
                                ) : (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 px-2 text-xs text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                    title="Revoke this certificate"
                                    aria-label={`Revoke ${certificate.id}`}
                                    onClick={() => {
                                      setRevokeReason("");
                                      setRevokeTarget(certificate);
                                    }}
                                  >
                                    <Ban className="h-3.5 w-3.5" />
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 px-2 text-xs text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                  title="Delete this record (recoverable)"
                                  aria-label={`Delete ${certificate.id}`}
                                  onClick={() => deleteCertificate(certificate)}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredCertificates.length === 0 && (
                      <TableRow className="hover:bg-transparent">
                        <TableCell colSpan={5} className="h-32 text-center text-sm text-muted-foreground">
                          {certificates.length === 0
                            ? "No certificates recorded yet. Click “+ Issue certificate” to add one."
                            : "No certificates match this search."}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </Card>

              {revokedCertificateCount > 0 && (
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Revoked certificates still resolve on the verification page, but they show as
                  invalid and hide the recipient name. Reinstate one to make it valid again.
                </p>
              )}

              {deletedCertificateCount > 0 && (
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {deletedCertificateCount} deleted{" "}
                  {deletedCertificateCount === 1 ? "record is" : "records are"} hidden from this
                  view and no longer verify. Choose “Deleted only” to restore one.
                </p>
              )}
            </div>
          )}

          {/* SECTION: ADMINISTRATORS */}
          {section === "admins" && (
            <div className="space-y-6">
              {/* Add Admin Card */}
              <Card className="rounded-xl border border-border bg-card shadow-xs">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-bold">Grant Administrator Privileges</CardTitle>
                  <CardDescription>
                    Administrators have full capabilities to add, edit and delete team members, roles, teams, and site settings.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Input
                      type="email"
                      placeholder="admin.colleague@kavisolutions.in"
                      value={newAdminEmail}
                      onChange={(e) => setNewAdminEmail(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addAdmin();
                        }
                      }}
                      className="max-w-md"
                    />
                    <Button onClick={addAdmin} disabled={!newAdminEmail.trim()} className="font-semibold">
                      <Plus className="h-4 w-4 mr-1.5" /> Grant Access
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Admins Table */}
              <Card className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
                <div className="border-b border-border px-5 py-3.5 bg-muted/30">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Current Administrators ({admins.length})
                  </span>
                </div>
                <div className="divide-y divide-border">
                  {admins.map((admin) => (
                    <div key={admin.email} className="flex items-center justify-between gap-4 px-5 py-3.5 hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <ShieldCheck className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-foreground">{admin.email}</p>
                          <p className="text-xs text-muted-foreground">
                            {admin.source === "env" ? "Configured in server environment" : "Added via administration console"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={`text-xs ${admin.source === "env" ? "border-blue-500/30 text-blue-500" : "border-border text-muted-foreground"}`}>
                          {admin.source === "env" ? "System" : "Database"}
                        </Badge>
                        {admin.source === "db" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2.5 text-xs text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => removeAdmin(admin.email)}
                          >
                            <Trash2 className="h-3.5 w-3.5 mr-1" /> Remove
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* SECTION: SETTINGS */}
          {section === "settings" && (
            <Card className="rounded-xl border border-border bg-card shadow-xs">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Workspace & Directory Settings</CardTitle>
                <CardDescription>
                  Configure public metadata and destination email addresses for the Kavi Solutions website.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 max-w-2xl">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-foreground">
                    Team Page Tagline
                  </label>
                  <Input
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    placeholder="e.g. The people behind the magic"
                  />
                  <p className="mt-1 text-[11px] text-muted-foreground">Displayed right under the team hero section title.</p>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-foreground">
                    Team Page Description
                  </label>
                  <textarea
                    className="flex min-h-[90px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="A small, senior team obsessed with craft. We sweat the details so you don't have to."
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-foreground">
                    Contact Form Inquiries Email
                  </label>
                  <Input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="contact@kavisolutions.in"
                  />
                  <p className="mt-1 text-[11px] text-muted-foreground">Recipient for customer inquiries submitted through the contact form.</p>
                </div>

                <div className="pt-2">
                  <Button onClick={saveSettings} className="font-semibold">
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Photo Lightbox Preview */}
          {preview && (
            <div
              className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
              onClick={() => setPreview(null)}
            >
              <div
                className="relative flex max-h-[85vh] max-w-xl flex-col items-center gap-4"
                onClick={(e) => e.stopPropagation()}
              >
                <img
                  src={preview}
                  alt="Full preview"
                  className="max-h-[75vh] w-auto rounded-2xl border border-white/20 object-contain shadow-2xl"
                />
                <Button variant="secondary" onClick={() => setPreview(null)}>
                  Close Preview
                </Button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
