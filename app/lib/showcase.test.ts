import { describe, expect, it } from "vitest";

import { pickShowcaseProjects, toShowcaseProject } from "./showcase";
import type { Project } from "./team";

const baseProject: Project = {
  id: "demo-project",
  name: "Demo Project",
  description: "A production platform.",
  appLink: "",
  webLink: "https://kavisolutions.in",
  liveLinkType: "web",
  projectTypes: ["Web"],
  skills: ["Next.js", "TypeScript", "PostgreSQL", "Redis", "Docker", "Go"],
  sortOrder: 1,
};

describe("toShowcaseProject", () => {
  it("maps API projects to the showcase shape", () => {
    const result = toShowcaseProject(baseProject, 0);

    expect(result.id).toBe("demo-project");
    expect(result.name).toBe("Demo Project");
    expect(result.category).toBe("Web Delivery");
    expect(result.metrics).toBe("Web · Live");
    expect(result.badge).toBe("Production Live");
    expect(result.icon).toBe("terminal");
    expect(result.skills).toEqual(["Next.js", "TypeScript", "PostgreSQL", "Redis", "Docker"]);
  });

  it("describes app and hybrid projects accurately", () => {
    expect(toShowcaseProject({ ...baseProject, liveLinkType: "app" }, 1).metrics).toBe(
      "Mobile · Live",
    );
    expect(toShowcaseProject({ ...baseProject, liveLinkType: "both" }, 2).metrics).toBe(
      "Web + App · Live",
    );
  });

  it("falls back when optional fields are empty", () => {
    const result = toShowcaseProject(
      {
        ...baseProject,
        description: "   ",
        projectTypes: [],
        skills: [],
      },
      3,
    );

    expect(result.description).toMatch(/Kavi Solutions/);
    expect(result.category).toBe("Production Delivery");
    expect(result.skills).toEqual([]);
    expect(result.icon).toBe("map-pin");
  });
});

describe("pickShowcaseProjects", () => {
  it("limits the showcase to the requested number", () => {
    const projects = Array.from({ length: 6 }, (_, index) => ({
      ...baseProject,
      id: `project-${index}`,
      name: `Project ${index}`,
    }));

    expect(pickShowcaseProjects(projects)).toHaveLength(4);
    expect(pickShowcaseProjects(projects).map((project) => project.id)).toEqual([
      "project-0",
      "project-1",
      "project-2",
      "project-3",
    ]);
  });

  it("handles an empty list", () => {
    expect(pickShowcaseProjects([])).toEqual([]);
  });
});
