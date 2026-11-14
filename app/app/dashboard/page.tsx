"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  User,
  Award,
  Sparkles,
  ShieldCheck,
  Layers,
  ExternalLink,
  Pencil,
  CheckCircle2,
  Clock,
  Mail,
  Globe,
  Upload,
  LogOut,
  ArrowRight,
  Search,
  ChevronRight,
  BadgeCheck,
  Smartphone,
  Cpu,
  Sprout,
  Landmark,
  BarChart3,
  CircleDollarSign,
  Lock,
  GraduationCap,
} from "lucide-react";
import { authClient, useAuth } from "@/lib/auth-context";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GradientPicker from "@/components/GradientPicker";
import { GlowOrb, Reveal, RevealItem, RevealStagger, TiltCard } from "@/components/motion";
import type { OrgRole, OrgTeam } from "@/lib/team";

type MeResponse = {
  user: { id: string; email: string } | null;
  isAdmin: boolean;
  roles: OrgRole[];
  teams: OrgTeam[];
  member: {
    id: string;
    name: string;
    role: string;
    bio: string;
    imageUrl: string | null;
    profileUrl: string | null;
    linkedinUrl: string | null;
    gradient: string;
    teamId: string | null;
    teamName: string | null;
  } | null;
};

type CertificateData = {
  id: string;
  type: string;
  title: string;
  recipient: string;
  programme: string | null;
  role: string | null;
  issuedOn: string;
  summary: string | null;
  status: "issued" | "revoked";
};

type TabKey = "overview" | "profile" | "certificates" | "workspace";

export default function DashboardPage() {
  const { session, loading: authLoading } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [me, setMe] = useState<MeResponse | null>(null);
  const [loaded, setLoaded] = useState(false);

  // Profile form state
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [bio, setBio] = useState("");
  const [profileUrl, setProfileUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [gradient, setGradient] = useState<string>("from-violet-500 to-purple-500");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Certificate lookup state
  const [certInput, setCertInput] = useState("KV-FEL-2026-0001");
  const [certLoading, setCertLoading] = useState(false);
  const [certificate, setCertificate] = useState<CertificateData | null>(null);
  const [certError, setCertError] = useState("");

  const loadProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/me", { credentials: "include" });
      const data: MeResponse = await res.json();
      setMe(data);

      if (data.member) {
        setName(data.member.name);
        setRole(data.member.role);
        setBio(data.member.bio ?? "");
        setProfileUrl(data.member.profileUrl ?? "");
        setLinkedinUrl(data.member.linkedinUrl ?? "");
        setGradient(data.member.gradient || "from-violet-500 to-purple-500");
        setImageUrl(data.member.imageUrl);
      }
    } catch {
      setError("Could not load user data");
    } finally {
      setLoaded(true);
    }
  }, []);

  const lookupCertificate = useCallback(async (id: string) => {
    if (!id.trim()) return;
    setCertLoading(true);
    setCertError("");
    try {
      const res = await fetch(`/api/certificates/${encodeURIComponent(id.trim())}`);
      if (!res.ok) {
        setCertificate(null);
        setCertError("Certificate not found. Check the ID format (e.g. KV-FEL-2026-0001).");
        return;
      }
      const data = await res.json();
      setCertificate(data.certificate);
    } catch {
      setCertError("Error verifying certificate. Please try again.");
    } finally {
      setCertLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (session) {
      void loadProfile();
      void lookupCertificate("KV-FEL-2026-0001");
    }
  }, [authLoading, session, loadProfile, lookupCertificate]);

  const handleSignOut = async () => {
    await authClient.signOut();
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("kavi_bearer_token");
    }
    router.push("/");
    router.refresh();
  };

  const uploadImage = async (file: File) => {
    if (uploading) return;
    setUploading(true);
    setError("");

    const form = new FormData();
    form.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: form,
        credentials: "include",
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        setError(body?.message ?? "Image upload failed");
        return;
      }
      setImageUrl(body.url);
      setMessage("Photo uploaded! Remember to save changes.");
    } catch {
      setError("Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!me?.member?.id || saving) return;
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const res = await fetch(`/api/team/${me.member.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name,
          role,
          bio,
          profileUrl,
          linkedinUrl,
          gradient,
          imageUrl,
        }),
      });

      const body = await res.json().catch(() => null);
      if (!res.ok) {
        setError(body?.message ?? "Failed to save profile changes");
        return;
      }

      setMessage("Profile changes saved successfully!");
      void loadProfile();
    } catch {
      setError("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink text-[#F7F9FC]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#175CD3] border-t-transparent" />
          <span className="font-mono text-xs text-[#A5B3C7]">Loading user workspace...</span>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-ink font-sans text-[#F7F9FC] flex flex-col justify-between">
        <Navbar />
        <main className="flex-grow flex items-center justify-center px-6 pt-36 pb-20">
          <TiltCard
            intensity={6}
            className="w-full max-w-[460px] rounded-[32px] bg-[rgba(18,29,47,0.88)] backdrop-blur-[20px] border border-[rgba(148,163,184,0.16)] p-8 sm:p-10 text-center shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#2563EB] to-[#06B6D4]" />
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 border border-blue-500/20 text-[#91B4FF]">
              <Lock className="h-6 w-6" />
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-[#F7F9FC] mb-2">
              Authentication Required
            </h1>
            <p className="text-[14px] leading-relaxed text-[#A5B3C7] mb-7">
              Sign in to your Kavi Solutions account to access your user dashboard, issued certificates, and workspace profile.
            </p>
            <Link
              href="/login?next=/dashboard"
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-[12px] bg-[#175CD3] hover:bg-[#1849A9] text-white text-[14px] font-medium transition-all shadow-[0_0_20px_rgba(23,92,211,0.35)]"
            >
              <span>Sign In to Continue</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </TiltCard>
        </main>
        <Footer />
      </div>
    );
  }

  const userEmail = session.user.email ?? "";
  const displayName = me?.member?.name || userEmail.split("@")[0] || "User";
  const userRole = me?.member?.role || (me?.isAdmin ? "Workspace Administrator" : "Studio Member");
  const userTeam = me?.member?.teamName || "Core Studio";
  const userGradient = me?.member?.gradient || "from-blue-600 to-indigo-600";

  return (
    <div className="min-h-screen bg-ink font-sans text-[#F7F9FC] flex flex-col justify-between">
      <Navbar />

      <main className="flex-grow px-6 pt-32 pb-24">
        {/* Ambient atmospheric glow orbs */}
        <GlowOrb className="top-1/4 left-1/4 w-[600px] h-[360px] bg-[#175CD3]/10 blur-[120px]" />
        <GlowOrb className="top-1/3 right-1/4 w-[480px] h-[320px] bg-[#06B6D4]/10 blur-[100px]" />

        <div className="mx-auto max-w-[1152px]">
          {/* Header Banner */}
          <Reveal className="mb-10">
            <div className="rounded-[28px] bg-[rgba(18,29,47,0.85)] backdrop-blur-[16px] border border-[rgba(148,163,184,0.16)] p-6 sm:p-8 lg:p-10 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.5)] relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#2563EB] via-[#91B4FF] to-[#06B6D4]" />

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  {/* User Avatar with Ring */}
                  <div className="relative">
                    <div
                      className={`relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-tr ${userGradient} shadow-md border-2 border-white/20`}
                    >
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={displayName}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <span className="font-display text-2xl font-bold text-white uppercase">
                          {displayName[0] ?? "U"}
                        </span>
                      )}
                    </div>
                    <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#151B2A] border-2 border-[#0B1220]">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#34D399] animate-pulse" />
                    </span>
                  </div>

                  {/* Greetings & Info */}
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#F7F9FC]">
                        {displayName}
                      </h1>
                      {me?.isAdmin && (
                        <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-mono font-semibold bg-blue-500/15 border border-blue-500/30 text-[#91B4FF]">
                          <ShieldCheck className="h-3 w-3" />
                          Administrator
                        </span>
                      )}
                    </div>
                    <p className="text-[14px] text-[#A5B3C7] flex items-center gap-2">
                      <span>{userRole}</span>
                      <span>·</span>
                      <span className="text-[#91B4FF] font-medium">{userTeam}</span>
                    </p>
                    <p className="text-xs text-[#7889A0] mt-1 font-mono">{userEmail}</p>
                  </div>
                </div>

                {/* Header Action Buttons */}
                <div className="flex flex-wrap items-center gap-3">
                  {me?.isAdmin && (
                    <Link
                      href="/admin"
                      className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 px-4 py-2.5 text-xs font-mono font-semibold text-[#91B4FF] transition-colors"
                    >
                      <ShieldCheck className="h-4 w-4" />
                      <span>Admin Console</span>
                      <ExternalLink className="h-3 w-3 ml-0.5" />
                    </Link>
                  )}
                  <Link
                    href="/team"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-[rgba(148,163,184,0.14)] px-4 py-2.5 text-xs font-mono font-medium text-[#A5B3C7] hover:text-[#F7F9FC] transition-colors"
                  >
                    <span>Public Directory</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-white/5 hover:bg-red-500/15 border border-[rgba(148,163,184,0.14)] hover:border-red-500/30 px-3.5 py-2.5 text-xs font-mono font-medium text-[#7889A0] hover:text-red-400 transition-colors"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </div>
          </Reveal>

          {/* 4 Stat Overview Tiles with 3D Tilt */}
          <Reveal className="mb-10">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <TiltCard
                intensity={5}
                className="rounded-[20px] bg-[rgba(18,29,47,0.8)] backdrop-blur-md border border-[rgba(148,163,184,0.14)] p-5 shadow-sm"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-[#7889A0]">
                    Role &amp; Privilege
                  </span>
                  <ShieldCheck className="h-4 w-4 text-[#91B4FF]" />
                </div>
                <div className="font-display text-xl font-bold text-[#F7F9FC] truncate">
                  {me?.isAdmin ? "Administrator" : "Studio Member"}
                </div>
                <span className="text-[11px] font-mono text-[#34D399] mt-1 inline-flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Verified Member
                </span>
              </TiltCard>

              <TiltCard
                intensity={5}
                className="rounded-[20px] bg-[rgba(18,29,47,0.8)] backdrop-blur-md border border-[rgba(148,163,184,0.14)] p-5 shadow-sm"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-[#7889A0]">
                    Assigned Team
                  </span>
                  <Layers className="h-4 w-4 text-[#38BDF8]" />
                </div>
                <div className="font-display text-xl font-bold text-[#F7F9FC] truncate">
                  {userTeam}
                </div>
                <span className="text-[11px] font-mono text-[#7889A0] mt-1 block">
                  Studio Collective
                </span>
              </TiltCard>

              <TiltCard
                intensity={5}
                className="rounded-[20px] bg-[rgba(18,29,47,0.8)] backdrop-blur-md border border-[rgba(148,163,184,0.14)] p-5 shadow-sm"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-[#7889A0]">
                    Credential Status
                  </span>
                  <Award className="h-4 w-4 text-[#C084FC]" />
                </div>
                <div className="font-display text-xl font-bold text-[#F7F9FC] truncate">
                  Valid &amp; Audited
                </div>
                <span className="text-[11px] font-mono text-[#C084FC] mt-1 block">
                  Public Ledger Registry
                </span>
              </TiltCard>

              <TiltCard
                intensity={5}
                className="rounded-[20px] bg-[rgba(18,29,47,0.8)] backdrop-blur-md border border-[rgba(148,163,184,0.14)] p-5 shadow-sm"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-[#7889A0]">
                    Account Session
                  </span>
                  <Clock className="h-4 w-4 text-[#34D399]" />
                </div>
                <div className="font-display text-xl font-bold text-[#F7F9FC] truncate">
                  Active
                </div>
                <span className="text-[11px] font-mono text-[#34D399] mt-1 inline-flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#34D399] animate-pulse" />
                  Connected
                </span>
              </TiltCard>
            </div>
          </Reveal>

          {/* Navigation Tabs Bar */}
          <div className="mb-8 flex flex-wrap items-center gap-2 border-b border-[rgba(148,163,184,0.12)] pb-4">
            <button
              onClick={() => setActiveTab("overview")}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-mono font-medium transition-all ${
                activeTab === "overview"
                  ? "bg-[#175CD3] text-white shadow-[0_0_20px_rgba(23,92,211,0.4)]"
                  : "bg-white/5 text-[#7889A0] hover:text-[#F7F9FC] hover:bg-white/10"
              }`}
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              <span>Workspace Overview</span>
            </button>

            <button
              onClick={() => setActiveTab("profile")}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-mono font-medium transition-all ${
                activeTab === "profile"
                  ? "bg-[#175CD3] text-white shadow-[0_0_20px_rgba(23,92,211,0.4)]"
                  : "bg-white/5 text-[#7889A0] hover:text-[#F7F9FC] hover:bg-white/10"
              }`}
            >
              <User className="h-3.5 w-3.5" />
              <span>Edit Profile &amp; Bio</span>
            </button>

            <button
              onClick={() => setActiveTab("certificates")}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-mono font-medium transition-all ${
                activeTab === "certificates"
                  ? "bg-[#175CD3] text-white shadow-[0_0_20px_rgba(23,92,211,0.4)]"
                  : "bg-white/5 text-[#7889A0] hover:text-[#F7F9FC] hover:bg-white/10"
              }`}
            >
              <Award className="h-3.5 w-3.5" />
              <span>Certificates &amp; Credentials</span>
            </button>

            <button
              onClick={() => setActiveTab("workspace")}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-mono font-medium transition-all ${
                activeTab === "workspace"
                  ? "bg-[#175CD3] text-white shadow-[0_0_20px_rgba(23,92,211,0.4)]"
                  : "bg-white/5 text-[#7889A0] hover:text-[#F7F9FC] hover:bg-white/10"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Studio Directory &amp; Verticals</span>
            </button>
          </div>

          {/* TAB 1: WORKSPACE OVERVIEW */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Member Card & Bio (7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                <TiltCard
                  intensity={4}
                  className="rounded-[24px] bg-[rgba(18,29,47,0.85)] backdrop-blur-[16px] border border-[rgba(148,163,184,0.16)] p-6 sm:p-8"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-[#7889A0]">
                      MEMBER PROFILE SUMMARY
                    </span>
                    <button
                      onClick={() => setActiveTab("profile")}
                      className="inline-flex items-center gap-1 text-xs font-mono text-[#91B4FF] hover:underline"
                    >
                      <Pencil className="h-3 w-3" />
                      <span>Edit</span>
                    </button>
                  </div>

                  <h3 className="font-display text-xl font-bold text-[#F7F9FC] mb-1">
                    {displayName}
                  </h3>
                  <p className="text-[13px] font-medium text-[#91B4FF] mb-4">
                    {userRole} · <span className="text-[#A5B3C7]">{userTeam}</span>
                  </p>

                  <p className="text-[14px] leading-relaxed text-[#A5B3C7] mb-6">
                    {me?.member?.bio ||
                      "No biography provided yet. Click 'Edit Profile' to add your engineering focus, background, and specialties."}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-[rgba(148,163,184,0.12)]">
                    {me?.member?.linkedinUrl ? (
                      <a
                        href={me.member.linkedinUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-mono bg-white/5 text-[#91B4FF] hover:bg-white/10 transition-colors border border-[rgba(148,163,184,0.14)]"
                      >
                        <span>LinkedIn</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <span className="text-xs text-[#7889A0] font-mono">No LinkedIn linked</span>
                    )}

                    {me?.member?.profileUrl && (
                      <a
                        href={me.member.profileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-mono bg-white/5 text-[#34D399] hover:bg-white/10 transition-colors border border-[rgba(148,163,184,0.14)]"
                      >
                        <Globe className="h-3 w-3" />
                        <span>Personal Site</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </TiltCard>

                {/* Team Status Card */}
                <TiltCard
                  intensity={4}
                  className="rounded-[24px] bg-[rgba(18,29,47,0.85)] backdrop-blur-[16px] border border-[rgba(148,163,184,0.16)] p-6 sm:p-8"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-[#7889A0]">
                      WORKSPACE COLLECTIVE
                    </span>
                    <Link
                      href="/team"
                      className="text-xs font-mono text-[#91B4FF] hover:underline inline-flex items-center gap-1"
                    >
                      <span>All members</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>

                  <h3 className="font-display text-lg font-bold text-[#F7F9FC] mb-2">
                    Department: {userTeam}
                  </h3>
                  <p className="text-[13px] leading-relaxed text-[#A5B3C7] mb-5">
                    You are part of the {userTeam} group within Kavi Solutions. Your work is reflected across our client production builds and public team index.
                  </p>

                  <div className="rounded-xl bg-[#151B2A]/90 border border-[rgba(148,163,184,0.1)] p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="h-2 w-2 rounded-full bg-[#34D399]" />
                        <span className="text-xs font-mono text-[#F7F9FC]">Studio Health Status</span>
                      </div>
                      <span className="text-xs font-mono text-[#34D399]">99.9% Uptime SLA</span>
                    </div>
                  </div>
                </TiltCard>
              </div>

              {/* Right Column: Quick Shortcuts & Verification (5 cols) */}
              <div className="lg:col-span-5 space-y-6">
                {/* Certificate Quick Card */}
                <TiltCard
                  intensity={4}
                  className="rounded-[24px] bg-[rgba(18,29,47,0.85)] backdrop-blur-[16px] border border-[rgba(148,163,184,0.16)] p-6 sm:p-7 relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#F59E0B] to-[#F97316]" />

                  <div className="flex items-center gap-2 mb-3">
                    <Award className="h-4 w-4 text-[#FBBF24]" />
                    <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-[#FBBF24]">
                      VERIFIABLE CREDENTIALS
                    </span>
                  </div>

                  <h4 className="font-display text-base font-bold text-[#F7F9FC] mb-1.5">
                    Official Certificate Registry
                  </h4>
                  <p className="text-xs text-[#A5B3C7] leading-relaxed mb-4">
                    Verify fellowship awards, surveyor accreditations, or enterprise project certificates on our public registry.
                  </p>

                  <button
                    onClick={() => setActiveTab("certificates")}
                    className="w-full inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-white/5 hover:bg-white/10 border border-[rgba(148,163,184,0.16)] text-xs font-mono text-[#F7F9FC] transition-colors"
                  >
                    <span>Check Credentials</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </TiltCard>

                {/* Quick Studio Actions */}
                <div className="rounded-[24px] bg-[rgba(18,29,47,0.85)] backdrop-blur-[16px] border border-[rgba(148,163,184,0.16)] p-6">
                  <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-[#7889A0] block mb-4">
                    QUICK NAVIGATION
                  </span>

                  <div className="space-y-2">
                    <Link
                      href="/projects"
                      className="flex items-center justify-between p-3 rounded-xl bg-[#151B2A]/70 hover:bg-[#19202E] border border-[rgba(148,163,184,0.08)] transition-all group"
                    >
                      <div className="flex items-center gap-2.5">
                        <Layers className="h-4 w-4 text-[#91B4FF]" />
                        <span className="text-xs font-medium text-[#F7F9FC]">Shipped Projects</span>
                      </div>
                      <ChevronRight className="h-3.5 w-3.5 text-[#7889A0] group-hover:translate-x-0.5 transition-transform" />
                    </Link>

                    <Link
                      href="/fellowship"
                      className="flex items-center justify-between p-3 rounded-xl bg-[#151B2A]/70 hover:bg-[#19202E] border border-[rgba(148,163,184,0.08)] transition-all group"
                    >
                      <div className="flex items-center gap-2.5">
                        <GraduationCap className="h-4 w-4 text-[#FBBF24]" />
                        <span className="text-xs font-medium text-[#F7F9FC]">Fellowship Residency</span>
                      </div>
                      <ChevronRight className="h-3.5 w-3.5 text-[#7889A0] group-hover:translate-x-0.5 transition-transform" />
                    </Link>

                    <Link
                      href="/farms"
                      className="flex items-center justify-between p-3 rounded-xl bg-[#151B2A]/70 hover:bg-[#19202E] border border-[rgba(148,163,184,0.08)] transition-all group"
                    >
                      <div className="flex items-center gap-2.5">
                        <Sprout className="h-4 w-4 text-[#84CC16]" />
                        <span className="text-xs font-medium text-[#F7F9FC]">Kavi Farms</span>
                      </div>
                      <ChevronRight className="h-3.5 w-3.5 text-[#7889A0] group-hover:translate-x-0.5 transition-transform" />
                    </Link>

                    <Link
                      href="/#contact"
                      className="flex items-center justify-between p-3 rounded-xl bg-[#151B2A]/70 hover:bg-[#19202E] border border-[rgba(148,163,184,0.08)] transition-all group"
                    >
                      <div className="flex items-center gap-2.5">
                        <Mail className="h-4 w-4 text-[#34D399]" />
                        <span className="text-xs font-medium text-[#F7F9FC]">Contact &amp; Quotes</span>
                      </div>
                      <ChevronRight className="h-3.5 w-3.5 text-[#7889A0] group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: EDIT PROFILE */}
          {activeTab === "profile" && (
            <TiltCard
              intensity={3}
              className="rounded-[28px] bg-[rgba(18,29,47,0.85)] backdrop-blur-[16px] border border-[rgba(148,163,184,0.16)] p-6 sm:p-10 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#2563EB] to-[#91B4FF]" />

              <div className="mb-8">
                <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-[#91B4FF]">
                  CUSTOMIZATION &amp; BRANDING
                </span>
                <h2 className="font-display text-2xl font-bold text-[#F7F9FC] mt-1">
                  Edit Member Profile
                </h2>
                <p className="text-xs text-[#A5B3C7] mt-1">
                  Updates to your display name, title, bio, and social links are reflected across the team directory.
                </p>
              </div>

              {message && (
                <div className="mb-6 rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-4 text-xs font-mono text-emerald-400">
                  {message}
                </div>
              )}

              {error && (
                <div className="mb-6 rounded-xl bg-red-500/10 border border-red-500/30 p-4 text-xs font-mono text-red-400">
                  {error}
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-6">
                {/* Photo & Gradient Customizer */}
                <div className="rounded-2xl bg-[#151B2A]/90 border border-[rgba(148,163,184,0.12)] p-6">
                  <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-[#7889A0] block mb-4">
                    Avatar &amp; Color Theme
                  </span>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                    <div
                      className={`relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-tr ${gradient} border-2 border-white/20 shadow-md`}
                    >
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt="Preview"
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <span className="font-display text-3xl font-bold text-white uppercase">
                          {name[0] ?? userEmail[0] ?? "U"}
                        </span>
                      )}
                    </div>

                    <div className="flex-grow space-y-3 w-full">
                      <div className="flex flex-wrap items-center gap-3">
                        <label className="inline-flex items-center gap-2 cursor-pointer rounded-xl bg-white/5 hover:bg-white/10 border border-[rgba(148,163,184,0.16)] px-4 py-2 text-xs font-mono text-[#F7F9FC] transition-colors">
                          <Upload className="h-3.5 w-3.5 text-[#91B4FF]" />
                          <span>{uploading ? "Uploading..." : "Upload Photo"}</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) void uploadImage(file);
                            }}
                          />
                        </label>

                        {imageUrl && (
                          <button
                            type="button"
                            onClick={() => setImageUrl(null)}
                            className="text-xs font-mono text-red-400 hover:underline"
                          >
                            Remove photo
                          </button>
                        )}
                      </div>

                      <div className="pt-2">
                        <span className="font-mono text-[10px] text-[#7889A0] block mb-2">
                          OR CHOOSE FALLBACK GRADIENT:
                        </span>
                        <GradientPicker value={gradient} onChange={setGradient} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-mono text-[#7889A0] uppercase tracking-wider mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Arjun Mehta"
                      required
                      className="w-full h-11 px-4 rounded-xl bg-[#06060F] border border-[rgba(148,163,184,0.2)] text-[14px] text-[#F7F9FC] focus:outline-none focus:border-[#91B4FF]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-[#7889A0] uppercase tracking-wider mb-2">
                      Role / Title
                    </label>
                    <input
                      type="text"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      placeholder="e.g. Staff Distributed Systems Engineer"
                      required
                      className="w-full h-11 px-4 rounded-xl bg-[#06060F] border border-[rgba(148,163,184,0.2)] text-[14px] text-[#F7F9FC] focus:outline-none focus:border-[#91B4FF]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-[#7889A0] uppercase tracking-wider mb-2">
                    Biography
                  </label>
                  <textarea
                    rows={4}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell your story, areas of focus, key engineering repositories..."
                    className="w-full p-4 rounded-xl bg-[#06060F] border border-[rgba(148,163,184,0.2)] text-[14px] text-[#F7F9FC] focus:outline-none focus:border-[#91B4FF] resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-mono text-[#7889A0] uppercase tracking-wider mb-2">
                      LinkedIn Profile URL
                    </label>
                    <input
                      type="url"
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                      placeholder="https://linkedin.com/in/username"
                      className="w-full h-11 px-4 rounded-xl bg-[#06060F] border border-[rgba(148,163,184,0.2)] text-[14px] text-[#F7F9FC] focus:outline-none focus:border-[#91B4FF]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-[#7889A0] uppercase tracking-wider mb-2">
                      Personal Portfolio / Website
                    </label>
                    <input
                      type="url"
                      value={profileUrl}
                      onChange={(e) => setProfileUrl(e.target.value)}
                      placeholder="https://example.com"
                      className="w-full h-11 px-4 rounded-xl bg-[#06060F] border border-[rgba(148,163,184,0.2)] text-[14px] text-[#F7F9FC] focus:outline-none focus:border-[#91B4FF]"
                    />
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-end gap-3">
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#175CD3] hover:bg-[#1849A9] text-white px-7 text-xs font-mono font-semibold transition-all shadow-[0_0_20px_rgba(23,92,211,0.35)] disabled:opacity-60"
                  >
                    <span>{saving ? "Saving Changes..." : "Save Profile Changes"}</span>
                    <CheckCircle2 className="h-4 w-4" />
                  </button>
                </div>
              </form>
            </TiltCard>
          )}

          {/* TAB 3: CERTIFICATES & CREDENTIALS */}
          {activeTab === "certificates" && (
            <div className="space-y-8">
              {/* Lookup Card */}
              <TiltCard
                intensity={3}
                className="rounded-[28px] bg-[rgba(18,29,47,0.85)] backdrop-blur-[16px] border border-[rgba(148,163,184,0.16)] p-6 sm:p-8"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Award className="h-4 w-4 text-[#FBBF24]" />
                  <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-[#FBBF24]">
                    OFFICIAL CREDENTIAL VERIFIER
                  </span>
                </div>
                <h3 className="font-display text-xl font-bold text-[#F7F9FC] mb-2">
                  Check &amp; Manage Your Certificates
                </h3>
                <p className="text-xs text-[#A5B3C7] mb-6">
                  Enter your unique certificate ID (e.g. KV-FEL-2026-0001) to verify its blockchain/ledger integrity, view awards, and download credentials.
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <div className="relative w-full">
                    <input
                      type="text"
                      value={certInput}
                      onChange={(e) => setCertInput(e.target.value)}
                      placeholder="e.g. KV-FEL-2026-0001"
                      className="w-full h-12 px-4 rounded-xl bg-[#06060F] border border-[rgba(148,163,184,0.2)] text-xs font-mono uppercase tracking-wider text-[#F7F9FC] focus:outline-none focus:border-[#91B4FF]"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => lookupCertificate(certInput)}
                    disabled={certLoading}
                    className="w-full sm:w-auto h-12 px-6 rounded-xl bg-[#175CD3] hover:bg-[#1849A9] text-white text-xs font-mono font-semibold transition-all shrink-0 shadow-[0_0_20px_rgba(23,92,211,0.35)] disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    <Search className="h-4 w-4" />
                    <span>{certLoading ? "Verifying..." : "Verify Certificate"}</span>
                  </button>
                </div>

                {certError && (
                  <p className="mt-3 text-xs font-mono text-red-400">{certError}</p>
                )}
              </TiltCard>

              {/* Verified Certificate Display Card */}
              {certificate && (
                <TiltCard
                  intensity={4}
                  className="rounded-[28px] bg-[rgba(18,29,47,0.92)] backdrop-blur-[20px] border border-[rgba(148,163,184,0.22)] p-7 sm:p-10 shadow-2xl relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#10B981] via-[#34D399] to-[#06B6D4]" />

                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6 border-b border-[rgba(148,163,184,0.12)]">
                    <div>
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-semibold mb-3">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>VERIFIED AUTHENTIC</span>
                      </div>
                      <h4 className="font-display text-2xl font-bold text-[#F7F9FC] mb-1">
                        {certificate.title}
                      </h4>
                      <p className="font-mono text-xs text-[#91B4FF]">ID: {certificate.id}</p>
                    </div>

                    <div className="text-left md:text-right">
                      <span className="font-mono text-[10px] text-[#7889A0] uppercase tracking-wider block">
                        ISSUED DATE
                      </span>
                      <span className="font-mono text-xs text-[#F7F9FC]">{certificate.issuedOn}</span>
                    </div>
                  </div>

                  <div className="py-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                      <span className="font-mono text-[10px] text-[#7889A0] uppercase tracking-wider block mb-1">
                        RECIPIENT NAME
                      </span>
                      <span className="font-display text-lg font-bold text-[#F7F9FC]">
                        {certificate.recipient}
                      </span>
                    </div>

                    {certificate.programme && (
                      <div>
                        <span className="font-mono text-[10px] text-[#7889A0] uppercase tracking-wider block mb-1">
                          PROGRAMME
                        </span>
                        <span className="text-[14px] font-medium text-[#F7F9FC]">
                          {certificate.programme}
                        </span>
                      </div>
                    )}

                    {certificate.role && (
                      <div>
                        <span className="font-mono text-[10px] text-[#7889A0] uppercase tracking-wider block mb-1">
                          DESIGNATION / ROLE
                        </span>
                        <span className="text-[14px] font-medium text-[#91B4FF]">
                          {certificate.role}
                        </span>
                      </div>
                    )}
                  </div>

                  {certificate.summary && (
                    <div className="p-4 rounded-xl bg-[#151B2A]/90 border border-[rgba(148,163,184,0.1)] text-xs leading-relaxed text-[#A5B3C7] mb-6">
                      {certificate.summary}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[rgba(148,163,184,0.12)]">
                    <span className="font-mono text-[11px] text-[#7889A0]">
                      Cryptographically signed by Kavi Solutions Trust Network
                    </span>

                    <Link
                      href={`/verify/${encodeURIComponent(certificate.id)}`}
                      className="inline-flex items-center gap-1.5 text-xs font-mono text-[#91B4FF] hover:underline"
                    >
                      <span>Public Verification URL</span>
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>
                </TiltCard>
              )}
            </div>
          )}

          {/* TAB 4: STUDIO VERTICALS */}
          {activeTab === "workspace" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  title: "Web Development",
                  desc: "Distributed Next.js, Go microservices and high-concurrency cloud architecture.",
                  href: "/web",
                  icon: Globe,
                  color: "text-[#91B4FF]",
                },
                {
                  title: "Mobile Platforms",
                  desc: "Native iOS (Swift), Android (Kotlin) and offline-first mobile synchronization.",
                  href: "/mobile",
                  icon: Smartphone,
                  color: "text-[#38BDF8]",
                },
                {
                  title: "Applied AI & ZK",
                  desc: "Deterministic agent runners, RAG vector retrieval and zero-knowledge verification.",
                  href: "/ai-blockchain",
                  icon: Cpu,
                  color: "text-[#C084FC]",
                },
                {
                  title: "Kavi Fellowship",
                  desc: "11-month intensive residency combining production code, Vipassana, and placements.",
                  href: "/fellowship",
                  icon: GraduationCap,
                  color: "text-[#FBBF24]",
                },
                {
                  title: "Kavi Farms",
                  desc: "Organic produce, wood-pressed oils and weekend village homestays in Palnadu, AP.",
                  href: "/farms",
                  icon: Sprout,
                  color: "text-[#84CC16]",
                },
                {
                  title: "Government Tech",
                  desc: "Citizen portals, exam registration engines and zero-trust security modernization.",
                  href: "/government",
                  icon: Landmark,
                  color: "text-[#06B6D4]",
                },
                {
                  title: "Survey & Research",
                  desc: "Pan-India field surveyor network with real-time GPS and photo verification.",
                  href: "/survey",
                  icon: BarChart3,
                  color: "text-[#EC4899]",
                },
                {
                  title: "Financial Services",
                  desc: "Year-round income tax filing, corporate bookkeeping and dynamic cash-flow forecasting.",
                  href: "/financial",
                  icon: CircleDollarSign,
                  color: "text-[#10B981]",
                },
                {
                  title: "Public Registry",
                  desc: "Cryptographic credential verification, QR scanning and public ledger registry.",
                  href: "/verify",
                  icon: ShieldCheck,
                  color: "text-[#3B82F6]",
                },
              ].map((vertical) => {
                const VIcon = vertical.icon;
                return (
                  <Link key={vertical.title} href={vertical.href} className="group">
                    <TiltCard
                      intensity={6}
                      className="h-full rounded-[24px] bg-[rgba(18,29,47,0.85)] backdrop-blur-[16px] border border-[rgba(148,163,184,0.16)] p-6 hover:border-[rgba(148,163,184,0.35)] transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <div className={`p-2.5 rounded-xl bg-white/5 border border-white/10 ${vertical.color}`}>
                            <VIcon className="h-5 w-5" />
                          </div>
                          <ArrowRight className="h-4 w-4 text-[#7889A0] group-hover:text-[#F7F9FC] group-hover:translate-x-1 transition-all" />
                        </div>
                        <h4 className="font-display text-lg font-bold text-[#F7F9FC] mb-2 group-hover:text-[#91B4FF] transition-colors">
                          {vertical.title}
                        </h4>
                        <p className="text-xs text-[#A5B3C7] leading-relaxed">
                          {vertical.desc}
                        </p>
                      </div>
                    </TiltCard>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
