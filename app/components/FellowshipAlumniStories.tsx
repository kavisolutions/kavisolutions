"use client";

import { useEffect, useState } from "react";
import { Quote } from "lucide-react";

import { Reveal } from "@/components/motion";

type Story = {
  name: string;
  cohort: string;
  track: string;
  destinationType: string;
  organisation: string;
  role: string;
  story: string;
};

const DESTINATION_LABELS: Record<string, string> = {
  job: "Employment",
  freelance: "Freelance / consulting",
  venture: "Founded a venture",
  further_study: "Further study",
  fellowship: "Another fellowship",
  other: "Other",
};

export default function FellowshipAlumniStories() {
  const [stories, setStories] = useState<Story[]>([]);

  useEffect(() => {
    let active = true;
    fetch("/api/fellowship-alumni/public")
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { stories?: Story[] } | null) => {
        if (active && data?.stories?.length) setStories(data.stories);
      })
      .catch(() => {
        // The section stays hidden when there are no consented stories.
      });
    return () => {
      active = false;
    };
  }, []);

  if (stories.length === 0) return null;

  return (
    <section id="alumni-stories" className="relative px-6 py-20">
      <div className="mx-auto max-w-[1152px]">
        <Reveal className="mx-auto mb-12 max-w-3xl text-center">
          <div className="mb-3 inline-flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#175CD3]" />
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-[#91B4FF]">
              ALUMNI STORIES
            </span>
          </div>
          <h2 className="font-display text-3xl font-semibold tracking-tight text-[#F7F9FC] sm:text-4xl lg:text-5xl">
            Where the first cohorts went next
          </h2>
          <p className="mt-4 text-base leading-relaxed text-[#A5B3C7]">
            Published only with the fellow&apos;s consent. Outcomes are verified by the
            programme team and updated as alumni share their progress.
          </p>
        </Reveal>

        <div className="grid gap-4 md:grid-cols-2">
          {stories.map((story) => (
            <Reveal
              key={`${story.name}-${story.story.slice(0, 24)}`}
              className="rounded-[20px] border border-[rgba(148,163,184,0.16)] bg-[rgba(18,29,47,0.85)] p-6 backdrop-blur-[16px]"
            >
              <Quote className="h-5 w-5 text-[#91B4FF]" />
              <p className="mt-3 text-sm leading-relaxed text-[#C7D2E5]">
                {story.story}
              </p>
              <div className="mt-4 border-t border-[rgba(148,163,184,0.16)] pt-3">
                <p className="text-sm font-semibold text-[#F7F9FC]">{story.name}</p>
                <p className="mt-0.5 text-[11px] text-[#A5B3C7]">
                  {story.track}
                  {story.cohort ? ` · ${story.cohort}` : ""}
                  {story.destinationType
                    ? ` · ${DESTINATION_LABELS[story.destinationType] ?? story.destinationType}`
                    : ""}
                  {story.organisation ? ` at ${story.organisation}` : ""}
                  {story.role ? ` · ${story.role}` : ""}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
