export const FELLOWSHIP_APPLICATION_STAGES = [
  "applied",
  "review",
  "interview",
  "offer",
  "accepted",
  "rejected",
  "withdrawn",
] as const;

export type FellowshipApplicationStage =
  (typeof FELLOWSHIP_APPLICATION_STAGES)[number];

export const FELLOWSHIP_STAGE_LABELS: Record<FellowshipApplicationStage, string> = {
  applied: "Application received",
  review: "Under review",
  interview: "Interview stage",
  offer: "Offer shared",
  accepted: "Offer accepted",
  rejected: "Not selected",
  withdrawn: "Withdrawn",
};

export const FELLOWSHIP_STAGE_TONES: Record<FellowshipApplicationStage, string> = {
  applied: "#3B82F6",
  review: "#06B6D4",
  interview: "#34D399",
  offer: "#8B5CF6",
  accepted: "#059669",
  rejected: "#F87171",
  withdrawn: "#7889A0",
};

export const FELLOWSHIP_PIPELINE_STAGES: FellowshipApplicationStage[] = [
  "applied",
  "review",
  "interview",
  "offer",
  "accepted",
];

export function isFellowshipStage(value: string): value is FellowshipApplicationStage {
  return (FELLOWSHIP_APPLICATION_STAGES as readonly string[]).includes(value);
}
