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
    id: "kavi-tent-on-rent",
    name: "Tent on Rent",
    category: "Multi-Vendor Rental Marketplace",
    description:
      "Date-based tent and event-equipment rental marketplace with verified owners, advance payments, a full order lifecycle and an Expo app on a NestJS API.",
    skills: ["Expo", "Next.js", "NestJS", "PostgreSQL", "Redis"],
    metrics: "Live · App + Web",
    badge: "Marketplace",
    icon: "map-pin",
    accent: "text-[#91B4FF]",
    gradient: "from-[#2563EB] to-[#91B4FF]",
  },
  {
    id: "kavi-where-am-i",
    name: "Where Am I",
    category: "AI Visual Inventory",
    description:
      "Turns cupboard photos into searchable objects, then shows exactly where each item is stored. Live at whereami.kavisolutions.in.",
    skills: ["Next.js", "Expo", "pgvector", "MinIO", "Groq"],
    metrics: "Live · AI Search",
    badge: "Computer Vision",
    icon: "activity",
    accent: "text-[#34D399]",
    gradient: "from-[#10B981] to-[#34D399]",
  },
  {
    id: "kavi-social-agent",
    name: "Social Agent",
    category: "AI Publishing Automation",
    description:
      "Imports a year of images, writes captions with a vision model, routes every post through Telegram approval and publishes to LinkedIn, Facebook and Instagram.",
    skills: ["Fastify", "TypeScript", "SQLite", "Node cron", "Meta API"],
    metrics: "Internal · Automation",
    badge: "AI Captions",
    icon: "cpu",
    accent: "text-[#C084FC]",
    gradient: "from-[#8B5CF6] to-[#C084FC]",
  },
  {
    id: "kavi-certificate-system",
    name: "Certificate System",
    category: "Print & Verification Platform",
    description:
      "Five print-ready certificate templates with QR verification, batch CSV issuing and an audit registry wired to the public /verify page.",
    skills: ["HTML/CSS", "JavaScript", "qrcode", "jsQR", "PDF"],
    metrics: "Live · Verification",
    badge: "Print Ready",
    icon: "terminal",
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
