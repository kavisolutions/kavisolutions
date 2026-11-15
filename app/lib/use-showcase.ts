"use client";

import { useEffect, useState } from "react";
import { Activity, Cpu, MapPin, Terminal, type LucideIcon } from "lucide-react";

import { pickShowcaseProjects, type ShowcaseIcon, type ShowcaseProject } from "./showcase";
import type { Project } from "./team";

export const ICON_MAP: Record<ShowcaseIcon, LucideIcon> = {
  terminal: Terminal,
  activity: Activity,
  cpu: Cpu,
  "map-pin": MapPin,
};

/* Shown until the API answers, and kept if it fails. The home page is a
   marketing surface: an API outage should never leave a blank section. */
export const FALLBACK_SHOWCASE_PROJECTS: ShowcaseProject[] = [
  {
    id: "apex-financial-ledger",
    name: "Apex Financial Ledger",
    category: "High-Concurrency Fintech",
    description:
      "Distributed ledger and fiscal audit system capable of sub-millisecond atomic settlement, multi-tenant balance assertions and zero-loss recovery journals.",
    skills: ["Raft Consensus", "Rust", "TimescaleDB", "gRPC", "Next.js"],
    metrics: "420k ops/sec",
    badge: "Raft Quorum 9/9",
    icon: "terminal",
    accent: "text-[#91B4FF]",
    gradient: "from-[#2563EB] to-[#91B4FF]",
  },
  {
    id: "pulse-health-ai",
    name: "Pulse Health AI",
    category: "Edge Biometrics & AI",
    description:
      "Real-time biometric telemetry and clinical triage assistant orchestrating edge signal filtering, predictive escalation and sealed clinical records.",
    skills: ["React Native", "FastAPI", "WebSockets", "TensorFlow Lite"],
    metrics: "18ms ingestion",
    badge: "98.4% accuracy",
    icon: "activity",
    accent: "text-[#34D399]",
    gradient: "from-[#10B981] to-[#34D399]",
  },
  {
    id: "orbit-saas-telemetry",
    name: "Orbit SaaS Telemetry",
    category: "Cloud Observability",
    description:
      "Developer-centric distributed tracing and observability portal with compressed columnar storage, live flamegraphs and anomaly alerting loops.",
    skills: ["ClickHouse", "Go", "OpenTelemetry", "Tailwind CSS"],
    metrics: "2.4B spans/day",
    badge: "p99 < 42ms",
    icon: "cpu",
    accent: "text-[#C084FC]",
    gradient: "from-[#8B5CF6] to-[#C084FC]",
  },
  {
    id: "fieldgrid-pan-india",
    name: "FieldGrid Pan-India",
    category: "Civic Mobile Platform",
    description:
      "Offline-first rural census and field surveyor platform engineered to reconcile conflict-free replicated data across spotty 2G and EDGE nodes.",
    skills: ["Flutter", "SQLite", "CRDTs", "PostGIS", "Go"],
    metrics: "140k+ surveys",
    badge: "Offline replicas",
    icon: "map-pin",
    accent: "text-[#38BDF8]",
    gradient: "from-[#0284C7] to-[#38BDF8]",
  },
];

/* Loads the four featured projects from GET /api/projects. The API is the
   source of truth, but the curated fallback keeps the section meaningful
   when the backend is unreachable or the seed has not run yet. */
export function useShowcaseProjects(limit = 4): ShowcaseProject[] {
  const [projects, setProjects] = useState<ShowcaseProject[]>(
    FALLBACK_SHOWCASE_PROJECTS.slice(0, limit),
  );

  useEffect(() => {
    let active = true;

    fetch("/api/projects")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { projects?: Project[] } | null) => {
        if (!active || !Array.isArray(data?.projects) || data.projects.length === 0) return;
        setProjects(pickShowcaseProjects(data.projects, limit));
      })
      .catch(() => {
        /* Keep the fallback. */
      });

    return () => {
      active = false;
    };
  }, [limit]);

  return projects;
}
