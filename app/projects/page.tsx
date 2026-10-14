"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import type { Project } from "@/lib/team";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | "App" | "Web">("all");

  useEffect(() => {
    fetch("/api/projects")
      .then((res) => res.json())
      .then((data: { projects?: Project[]; error?: string }) => {
        if (data.error) {
          setError(data.error);
          setState("error");
          return;
        }
        setProjects(Array.isArray(data.projects) ? data.projects : []);
        setState("ready");
      })
      .catch(() => {
        setError("Could not load projects");
        setState("error");
      });
  }, []);

  const visible =
    filter === "all"
      ? projects
      : projects.filter((p) => p.projectTypes.includes(filter));

  if (state === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink px-6 py-16 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 text-center">
          <Link href="/" className="mb-6 inline-block">
            <span className="font-display text-2xl font-semibold tracking-tight">
              Kavi<span className="text-gradient">Solutions</span>
            </span>
          </Link>
          <h1 className="mt-4 font-display text-4xl font-bold sm:text-5xl">
            Our <span className="text-gradient">Projects</span>
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-mist">
            Products we&apos;ve designed, built and shipped — from web platforms to mobile apps.
          </p>
        </div>

        {state === "error" && (
          <p className="text-center text-sm text-red-400">{error}</p>
        )}

        {state === "ready" && projects.length === 0 && (
          <p className="text-center text-sm text-mist">
            Projects are being updated. Please check back soon.
          </p>
        )}

        {projects.length > 0 && (
          <>
            <div className="mb-10 flex flex-wrap items-center justify-center gap-2">
              {(["all", "App", "Web"] as const).map((key) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
                    filter === key
                      ? "bg-gradient-to-r from-violet-600 to-sky-500 text-white shadow-glow"
                      : "bg-white/5 text-mist hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {key === "all" ? "All" : key}
                </button>
              ))}
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              {visible.map((project, i) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="group relative flex h-full flex-col overflow-hidden rounded-3xl glass p-6 shadow-lift transition-all duration-300 hover:-translate-y-2 hover:shadow-glow"
                >
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-500 font-display text-lg font-bold shadow-glow">
                      🚀
                    </div>
                    <div className="flex flex-wrap justify-end gap-1.5">
                      {project.projectTypes.map((type) => (
                        <span
                          key={type}
                          className="rounded-lg bg-sky-500/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-sky-300"
                        >
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>

                  <h3 className="font-display text-xl font-semibold leading-snug">
                    {project.name}
                  </h3>
                  {project.description && (
                    <p className="mt-2 text-sm leading-relaxed text-mist">
                      {project.description}
                    </p>
                  )}

                  {project.skills.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {project.skills.map((skill) => (
                        <span
                          key={skill}
                          className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-mist"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-auto flex flex-wrap gap-2 pt-5">
                    {project.webLink && (
                      <a
                        href={project.webLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-sky-500 px-4 py-2 text-xs font-semibold text-white shadow-glow transition-all hover:scale-[1.03]"
                      >
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                        </svg>
                        Visit website
                      </a>
                    )}
                    {project.appLink && (
                      <a
                        href={project.appLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-xl bg-white/5 px-4 py-2 text-xs font-semibold text-mist transition-all hover:bg-white/10 hover:text-white"
                      >
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        Open app
                      </a>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {visible.length === 0 && (
              <p className="text-center text-sm text-mist">No {filter} projects yet.</p>
            )}
          </>
        )}

        <div className="mt-16 text-center">
          <Link
            href="/#contact"
            className="rounded-xl bg-gradient-to-r from-violet-600 to-sky-500 px-6 py-3 text-sm font-semibold text-white shadow-glow transition-all hover:scale-[1.03]"
          >
            Want a project like these? Let&apos;s talk
          </Link>
        </div>
      </div>
    </div>
  );
}
