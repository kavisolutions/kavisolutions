"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, ExternalLink, Smartphone } from "lucide-react";
import type { Project } from "@/lib/team";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Reveal, RevealItem, RevealStagger, TiltCard } from "@/components/motion";

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

  return (
    <div className="min-h-screen bg-ink font-sans text-white">
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
              Selected <span className="bg-gradient-to-r from-[#91B4FF] to-[#68FCBF] bg-clip-text text-transparent">Projects</span>
            </h1>
            <p className="mx-auto mt-4 max-w-lg text-base text-[#A5B3C7]">
              Proven software products, platforms, and native apps crafted and deployed for high-growth firms.
            </p>
          </Reveal>

          {state === "loading" && (
            <div className="flex h-64 items-center justify-center text-sm font-mono text-[#7889A0]">
              Querying production registry...
            </div>
          )}

          {state === "error" && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-6 text-center text-sm text-red-300">
              {error}
            </div>
          )}

          {state === "ready" && projects.length === 0 && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-12 text-center text-sm text-[#A5B3C7]">
              Projects are being updated. Please check back soon.
            </div>
          )}

          {state === "ready" && projects.length > 0 && (
            <>
              {/* Filter Pills */}
              <div className="mb-10 flex flex-wrap items-center justify-center gap-2">
                {(["all", "App", "Web"] as const).map((key) => (
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
                            <span className="font-mono text-sm font-bold">#</span>
                          </div>
                          <div className="flex flex-wrap justify-end gap-1.5">
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

                        {project.skills.length > 0 && (
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

                      <div className="flex flex-wrap gap-3 pt-5 border-t border-[rgba(148,163,184,0.1)]">
                        {project.webLink && (
                          <a
                            href={project.webLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-[10px] bg-[#175CD3] hover:bg-[#1849A9] px-4 py-2 text-xs font-medium text-white transition-colors"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                            <span>Visit website</span>
                          </a>
                        )}
                        {project.appLink && (
                          <a
                            href={project.appLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-[10px] border border-[rgba(148,163,184,0.14)] bg-[#19202E] hover:bg-white/10 px-4 py-2 text-xs font-medium text-[#F7F9FC] transition-colors"
                          >
                            <Smartphone className="h-3.5 w-3.5 text-[#91B4FF]" />
                            <span>Open app</span>
                          </a>
                        )}
                      </div>
                    </TiltCard>
                  </RevealItem>
                ))}
              </RevealStagger>

              {visible.length === 0 && (
                <p className="mt-8 text-center text-sm font-mono text-[#7889A0]">
                  No {filter} projects match this criteria.
                </p>
              )}
            </>
          )}

          <div className="mt-20 text-center">
            <Link
              href="/#contact"
              className="inline-flex items-center gap-2 rounded-[12px] bg-[#175CD3] hover:bg-[#1849A9] px-8 py-3.5 text-sm font-medium text-white shadow-[0_0_24px_rgba(23,92,211,0.4)] transition-all group"
            >
              <span>Have a project in mind? Let&apos;s talk</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
