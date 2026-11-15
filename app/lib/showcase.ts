import type { Project } from "./team";

/* The home page showcase is a curated view of the projects API. Keep the
   mapping pure so the component only deals with rendering and the shape can
   be unit-tested without a browser. */

export type ShowcaseIcon = "terminal" | "activity" | "cpu" | "map-pin";

export type ShowcaseProject = {
  id: string;
  name: string;
  category: string;
  description: string;
  skills: string[];
  metrics: string;
  badge: string;
  icon: ShowcaseIcon;
  accent: string;
  gradient: string;
};

const ICONS: ShowcaseIcon[] = ["terminal", "activity", "cpu", "map-pin"];

const ACCENTS = ["text-[#91B4FF]", "text-[#34D399]", "text-[#C084FC]", "text-[#38BDF8]"];

const GRADIENTS = [
  "from-[#2563EB] to-[#91B4FF]",
  "from-[#10B981] to-[#34D399]",
  "from-[#8B5CF6] to-[#C084FC]",
  "from-[#0284C7] to-[#38BDF8]",
];

const FALLBACK_DESCRIPTION =
  "Production system designed, built and shipped by the Kavi Solutions team.";

export function toShowcaseProject(project: Project, index: number): ShowcaseProject {
  const types = (project.projectTypes ?? []).filter(Boolean);
  const skills = (project.skills ?? []).filter(Boolean).slice(0, 5);

  return {
    id: project.id,
    name: project.name,
    category: types.length > 0 ? `${types.join(" · ")} Delivery` : "Production Delivery",
    description: project.description?.trim() || FALLBACK_DESCRIPTION,
    skills,
    metrics:
      project.liveLinkType === "app"
        ? "Mobile · Live"
        : project.liveLinkType === "both"
          ? "Web + App · Live"
          : "Web · Live",
    badge: "Production Live",
    icon: ICONS[index % ICONS.length],
    accent: ACCENTS[index % ACCENTS.length],
    gradient: GRADIENTS[index % GRADIENTS.length],
  };
}

export function pickShowcaseProjects(projects: Project[], limit = 4): ShowcaseProject[] {
  return projects.slice(0, Math.max(0, limit)).map(toShowcaseProject);
}
