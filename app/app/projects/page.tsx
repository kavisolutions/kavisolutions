"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ExternalLink,
  Smartphone,
  Terminal,
  Activity,
  Cpu,
  MapPin,
  ShieldCheck,
  Lock,
} from "lucide-react";
import type { Project } from "@/lib/team";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Reveal, RevealItem, RevealStagger, TiltCard } from "@/components/motion";

type DisplayProject = Project & {
  metrics?: string;
  badge?: string;
  icon?: string;
};

const PORTFOLIO_PROJECTS: DisplayProject[] = [
  {
    id: "kavi-tent-on-rent",
    name: "Tent on Rent",
    description:
      "Multi-vendor tent and event-equipment rental marketplace with date-based inventory, verified owners, advance payments, order lifecycle and an Expo app on top of a NestJS API.",
    appLink: "",
    webLink: "https://tentonrent.kavisolutions.in",
    liveLinkType: "web",
    sortOrder: 1,
    projectTypes: ["App", "Web"],
    skills: [
      "Expo",
      "React Native",
      "Next.js",
      "NestJS",
      "PostgreSQL",
      "Redis",
      "MinIO",
      "Razorpay",
    ],
    metrics: "Live · App + Web",
    badge: "Marketplace",
    icon: "map-pin",
  },
  {
    id: "kavi-where-am-i",
    name: "Where Am I",
    description:
      "AI visual inventory that turns cupboard photos into searchable objects, then shows exactly where each item is stored. Live at whereami.kavisolutions.in.",
    appLink: "",
    webLink: "https://whereami.kavisolutions.in",
    liveLinkType: "web",
    sortOrder: 2,
    projectTypes: ["Web", "App"],
    skills: [
      "Next.js",
      "Expo",
      "better-auth",
      "Drizzle ORM",
      "PostgreSQL",
      "pgvector",
      "MinIO",
      "Groq",
    ],
    metrics: "Live · AI Search",
    badge: "Computer Vision",
    icon: "activity",
  },
  {
    id: "kavi-social-agent",
    name: "Social Agent",
    description:
      "Scheduled social publishing sidecar that imports a year of images, writes captions with a vision model, routes every post through Telegram approval and publishes to LinkedIn, Facebook and Instagram.",
    appLink: "",
    webLink: "",
    liveLinkType: "web",
    sortOrder: 3,
    projectTypes: ["Web"],
    skills: [
      "Fastify",
      "TypeScript",
      "SQLite",
      "Node cron",
      "LinkedIn API",
      "Meta Graph API",
      "Telegram Bot API",
    ],
    metrics: "Automation · Internal",
    badge: "AI Captions",
    icon: "cpu",
  },
  {
    id: "kavi-certificate-system",
    name: "Certificate System",
    description:
      "Print-ready certificate design system with five templates, QR verification, batch CSV issuing and an audit registry wired to the public /verify page.",
    appLink: "",
    webLink: "https://kavisolutions.in/verify",
    liveLinkType: "web",
    sortOrder: 4,
    projectTypes: ["Web"],
    skills: [
      "HTML/CSS",
      "JavaScript",
      "qrcode",
      "jsQR",
      "PDF generation",
      "QR verification",
    ],
    metrics: "Live · Verification",
    badge: "Print Ready",
    icon: "shield-check",
  },
  {
    id: "kavi-solutions-platform",
    name: "Kavi Solutions Platform",
    description:
      "This site: a Next.js 16 marketing platform with a NestJS API, Better Auth sign-in, admin-managed team, projects, certificates and surveyors, live page switches and MinIO uploads.",
    appLink: "",
    webLink: "https://kavisolutions.in",
    liveLinkType: "web",
    sortOrder: 5,
    projectTypes: ["Web", "Enterprise"],
    skills: [
      "Next.js",
      "React 19",
      "TypeScript",
      "Tailwind CSS",
      "NestJS",
      "PostgreSQL",
      "Drizzle ORM",
      "Better Auth",
      "Docker",
    ],
    metrics: "Live · Platform",
    badge: "Production",
    icon: "terminal",
  },
];

function ProjectIcon({ icon }: { icon?: string }) {
  switch (icon) {
    case "terminal":
      return <Terminal className="h-5 w-5" />;
    case "activity":
      return <Activity className="h-5 w-5" />;
    case "cpu":
      return <Cpu className="h-5 w-5" />;
    case "map-pin":
      return <MapPin className="h-5 w-5" />;
    case "shield-check":
      return <ShieldCheck className="h-5 w-5" />;
    case "lock":
      return <Lock className="h-5 w-5" />;
    default:
      return <Terminal className="h-5 w-5" />;
  }
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<DisplayProject[]>(PORTFOLIO_PROJECTS);
  const [filter, setFilter] = useState<"all" | "App" | "Web">("all");

  useEffect(() => {
    fetch("/api/projects")
      .then((res) => res.json())
      .then((data: { projects?: Project[]; error?: string }) => {
        if (!data.error && Array.isArray(data.projects) && data.projects.length > 0) {
          setProjects(data.projects);
        }
      })
      .catch(() => {
        // Keep the built-in portfolio while the API is unavailable.
      });
  }, []);

  const visible =
    filter === "all"
      ? projects
      : projects.filter((p) => p.projectTypes?.includes(filter));

  return (
    <div className="min-h-screen bg-ink font-sans text-[#F7F9FC]">
      <Navbar />

      <main className="px-6 pt-36 pb-20">
        <div className="mx-auto max-w-[1152px]">
          <Reveal className="mb-12 text-center">
            <div className="inline-flex items-center gap-2 mb-3">
              <span className="h-2 w-2 rounded-full bg-[#175CD3]" />
              <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-[#91B4FF]">
                SHIPPED PRODUCTION WORK
              </span>
            </div>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-[#F7F9FC]">
              Our <span className="bg-gradient-to-r from-[#91B4FF] to-[#68FCBF] bg-clip-text text-transparent">Projects</span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base text-[#A5B3C7]">
              Products we&apos;ve designed, built and shipped — from web platforms to mobile apps and mission-critical enterprise systems.
            </p>
          </Reveal>

          {/* Filter Pills */}
          <div className="mb-10 flex flex-wrap items-center justify-center gap-2">
            {(["all", "Web", "App"] as const).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                className={`rounded-full px-5 py-2 text-xs font-mono font-medium transition-all ${
                  filter === key
                    ? "bg-[#175CD3] text-white shadow-[0_0_20px_rgba(23,92,211,0.4)]"
                    : "bg-[#19202E] text-[#7889A0] hover:text-[#F7F9FC] border border-[rgba(148,163,184,0.14)]"
                }`}
              >
                {key === "all" ? "All Systems" : `${key} Applications`}
              </button>
            ))}
          </div>

          {/* Projects Grid with 3D Tilt */}
          <RevealStagger className="grid gap-6 sm:grid-cols-2">
            {visible.map((project) => (
              <RevealItem key={project.id}>
                <TiltCard
                  intensity={8}
                  className="group relative flex h-full flex-col justify-between overflow-hidden rounded-[24px] bg-[rgba(18,29,47,0.85)] backdrop-blur-[16px] border border-[rgba(148,163,184,0.16)] p-7 sm:p-8 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] hover:border-[rgba(148,163,184,0.35)] transition-all"
                >
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#2563EB] to-[#06B6D4]" />

                  <div>
                    <div className="mb-5 flex items-start justify-between gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#19202E] border border-[rgba(148,163,184,0.14)] text-[#91B4FF] group-hover:bg-[#175CD3] group-hover:text-white transition-colors">
                        <ProjectIcon icon={project.icon} />
                      </div>
                      <div className="flex flex-wrap justify-end gap-1.5">
                        {project.metrics && (
                          <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-[11px] font-mono text-emerald-400">
                            {project.metrics}
                          </span>
                        )}
                        {project.projectTypes.map((type) => (
                          <span
                            key={type}
                            className="rounded-full bg-[#151B2A] border border-[rgba(148,163,184,0.14)] px-3 py-1 text-[11px] font-mono text-[#91B4FF]"
                          >
                            {type}
                          </span>
                        ))}
                      </div>
                    </div>

                    <h3 className="font-display text-2xl font-semibold text-[#F7F9FC] mb-2 leading-snug">
                      {project.name}
                    </h3>
                    {project.description && (
                      <p className="text-[14px] leading-relaxed text-[#A5B3C7] mb-5">
                        {project.description}
                      </p>
                    )}

                    {project.skills && project.skills.length > 0 && (
                      <div className="mb-6 flex flex-wrap gap-1.5">
                        {project.skills.map((skill) => (
                          <span
                            key={skill}
                            className="rounded-md border border-[rgba(148,163,184,0.12)] bg-[#19202E]/60 px-2.5 py-1 text-[11px] font-mono text-[#7889A0]"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between border-t border-[rgba(148,163,184,0.12)] pt-4 text-xs font-mono text-[#7889A0]">
                    <span className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#34D399]" />
                      {project.badge || "Production Live"}
                    </span>
                    {project.webLink || project.appLink ? (
                      <a
                        href={project.webLink || project.appLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#91B4FF] group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1"
                      >
                        Visit live <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <span className="text-[#91B4FF] inline-flex items-center gap-1">
                        Case Spec <ArrowRight className="h-3 w-3" />
                      </span>
                    )}
                  </div>
                </TiltCard>
              </RevealItem>
            ))}
          </RevealStagger>

          {/* CTA Section from Stitch P03 */}
          <Reveal className="mt-20">
            <div className="relative overflow-hidden rounded-[28px] border border-[rgba(148,163,184,0.18)] bg-[rgba(18,29,47,0.85)] backdrop-blur-[20px] p-10 sm:p-14 text-center shadow-[0_20px_50px_-20px_rgba(0,0,0,0.6)]">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#2563EB] via-[#91B4FF] to-[#06B6D4]" />
              <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-[#F7F9FC] mb-4">
                Want an engineered system like these?
              </h2>
              <p className="mx-auto max-w-xl text-base text-[#A5B3C7] mb-8 leading-relaxed">
                From high-concurrency web backends to distributed mobile platforms, we architect and deploy production systems that scale.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/#contact"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-[12px] bg-[#175CD3] hover:bg-[#1849A9] text-white px-8 text-[15px] font-medium transition-all shadow-[0_0_24px_rgba(23,92,211,0.4)]"
                >
                  <span>Let&apos;s Talk</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </main>

      <Footer />
    </div>
  );
}
