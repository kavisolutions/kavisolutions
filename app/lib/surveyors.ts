/* Shared types for the surveyor network registry. Mirrors the API shape in
   api/src/modules/surveyors/surveyors.service.ts. */

export const SURVEYOR_STATUSES = ["applied", "verified", "active", "inactive", "rejected"] as const;

export type SurveyorStatus = (typeof SURVEYOR_STATUSES)[number];

export const SURVEYOR_STATUS_LABELS: Record<SurveyorStatus, string> = {
  applied: "Applied",
  verified: "Verified",
  active: "Active",
  inactive: "Inactive",
  rejected: "Rejected",
};

/* Colour intent per status, so the admin table and badges stay consistent. */
export const SURVEYOR_STATUS_TONES: Record<SurveyorStatus, string> = {
  applied: "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  verified: "border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-400",
  active: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  inactive: "border-border bg-muted text-muted-foreground",
  rejected: "border-destructive/30 bg-destructive/10 text-destructive",
};

export type Surveyor = {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  languages: string[];
  skills: string[];
  experience: string;
  notes: string;
  status: SurveyorStatus;
  verifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SurveyorDraft = {
  id?: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  languages: string;
  skills: string;
  experience: string;
  notes: string;
  status: SurveyorStatus;
};

export const emptySurveyorDraft = (): SurveyorDraft => ({
  name: "",
  email: "",
  phone: "",
  location: "",
  languages: "",
  skills: "",
  experience: "",
  notes: "",
  status: "applied",
});

export const toSurveyorDraft = (surveyor: Surveyor): SurveyorDraft => ({
  id: surveyor.id,
  name: surveyor.name,
  email: surveyor.email,
  phone: surveyor.phone,
  location: surveyor.location,
  languages: surveyor.languages.join(", "),
  skills: surveyor.skills.join(", "),
  experience: surveyor.experience,
  notes: surveyor.notes,
  status: surveyor.status,
});

export const splitCommaList = (value: string): string[] =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
