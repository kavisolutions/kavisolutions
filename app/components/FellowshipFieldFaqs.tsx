"use client";

import { useEffect, useState } from "react";
import { MessageCircleQuestion, Loader2 } from "lucide-react";

import { Reveal } from "@/components/motion";

type PublicFaq = {
  id: string;
  audience: string;
  question: string;
  answer: string;
};

export default function FellowshipFieldFaqs() {
  const [faqs, setFaqs] = useState<PublicFaq[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const response = await fetch("/api/fellowship-programme/public/faqs");
        if (!response.ok) return;
        const data = (await response.json()) as { faqs?: PublicFaq[] };
        if (active) setFaqs(data.faqs ?? []);
      } catch {
        // The static FAQ still works if this request fails.
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-6 text-xs text-[#7889A0]">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Loading field questions…
      </div>
    );
  }

  if (faqs.length === 0) return null;

  return (
    <section className="relative px-6 pb-4">
      <div className="mx-auto max-w-3xl">
        <Reveal className="mb-6">
          <div className="mb-3 inline-flex items-center gap-2">
            <MessageCircleQuestion className="h-4 w-4 text-[#91B4FF]" />
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-[#91B4FF]">
              FROM COLLEGES, PARENTS AND STUDENTS
            </span>
          </div>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-[#F7F9FC] sm:text-3xl">
            Questions we heard in the field
          </h2>
          <p className="mt-2 text-sm text-[#A5B3C7]">
            These answers were added by the outreach team after real college and
            family conversations.
          </p>
        </Reveal>
        <div className="space-y-3">
          {faqs.map((faq) => (
            <details
              key={faq.id}
              className="group rounded-[18px] border border-[rgba(148,163,184,0.16)] bg-[rgba(18,29,47,0.85)] p-5 backdrop-blur-[16px]"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-sm font-semibold text-[#F7F9FC]">
                <span>
                  <span className="mr-2 rounded-full border border-[rgba(148,163,184,0.2)] px-2 py-0.5 font-mono text-[9px] uppercase tracking-wide text-[#91B4FF]">
                    {faq.audience}
                  </span>
                  {faq.question}
                </span>
                <span className="font-mono text-[#91B4FF] transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-[#A5B3C7]">{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
