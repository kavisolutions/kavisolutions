export const FELLOWSHIP_APPLICATION_STAGES = [
  "applied",
  "review",
  "interview",
  "waitlisted",
  "offer",
  "accepted",
  "onboarded",
  "active",
  "completed",
  "rejected",
  "withdrawn",
] as const;

export type FellowshipApplicationStage =
  (typeof FELLOWSHIP_APPLICATION_STAGES)[number];

export const FELLOWSHIP_STAGE_LABELS: Record<FellowshipApplicationStage, string> = {
  applied: "Application received",
  review: "Under review",
  interview: "Interview stage",
  waitlisted: "Waitlisted",
  offer: "Offer shared",
  accepted: "Offer accepted",
  onboarded: "Onboarding complete",
  active: "Fellowship active",
  completed: "Fellowship completed",
  rejected: "Not selected",
  withdrawn: "Withdrawn",
};

export const FELLOWSHIP_STAGE_TONES: Record<FellowshipApplicationStage, string> = {
  applied: "#3B82F6",
  review: "#06B6D4",
  interview: "#34D399",
  waitlisted: "#F59E0B",
  offer: "#8B5CF6",
  accepted: "#059669",
  onboarded: "#0EA5E9",
  active: "#10B981",
  completed: "#14B8A6",
  rejected: "#F87171",
  withdrawn: "#7889A0",
};

/* The primary path shown on the public status page. Waitlisted, rejected and
   withdrawn applications are handled as branches, not pipeline steps. */
export const FELLOWSHIP_PIPELINE_STAGES: FellowshipApplicationStage[] = [
  "applied",
  "review",
  "interview",
  "offer",
  "accepted",
  "onboarded",
  "active",
  "completed",
];

export const FELLOWSHIP_OPEN_STAGES: FellowshipApplicationStage[] = [
  "accepted",
  "onboarded",
  "active",
  "completed",
];

export function isFellowshipStage(value: string): value is FellowshipApplicationStage {
  return (FELLOWSHIP_APPLICATION_STAGES as readonly string[]).includes(value);
}
