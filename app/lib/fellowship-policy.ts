"use client";

import { useEffect, useState } from "react";

export type FellowshipPolicy = {
  fee: string;
  scholarship: string;
  stipend: string;
  accommodation: string;
  insurance: string;
  eligibility: string;
  leave: string;
  cohortNote: string;
  nextIntake: string;
  seats: string;
  updatedAt: string | null;
};

export const FELLOWSHIP_POLICY_DEFAULTS: FellowshipPolicy = {
  fee: "No payment is collected through this website. Contribution and scholarship options are confirmed in writing before an offer.",
  scholarship: "Scholarship options are discussed before an offer and recorded in the cohort terms.",
  stipend: "There is no salary during the learning phase. A project stipend is paid only when confirmed in writing for a specific project.",
  accommodation: "Accommodation and food arrangements are cohort-specific. Ask for the written cohort terms before accepting an offer.",
  insurance: "Insurance or medical support is cohort-specific. Ask for the written cohort terms before accepting an offer.",
  eligibility:
    "Diploma graduates, final-year students, graduates, women returning to work and career switchers can apply. The programme is full-time for 11 months.",
  leave:
    "Sunday is protected rest. Leave outside the published calendar is agreed with the programme team before the cohort begins.",
  cohortNote:
    "Cohort residencies are announced per batch. A specific city is not guaranteed; allocation depends on track, project and cohort fit.",
  nextIntake: "January 2027",
  seats: "Limited seats · confirmed per cohort",
  updatedAt: null,
};

export function useFellowshipPolicy() {
  const [policy, setPolicy] = useState<FellowshipPolicy>(FELLOWSHIP_POLICY_DEFAULTS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;

    fetch("/api/fellowship-policy")
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { policy?: Partial<FellowshipPolicy> } | null) => {
        if (!active) return;
        if (data?.policy) {
          setPolicy((current) => ({ ...current, ...data.policy }));
        }
        setLoaded(true);
      })
      .catch(() => {
        if (active) setLoaded(true);
      });

    return () => {
      active = false;
    };
  }, []);

  return { policy, loaded };
}
