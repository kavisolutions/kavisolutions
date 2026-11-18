import { apiErrorMessage } from "@/lib/api-error";
import type { FellowshipApplicationStage } from "@/lib/fellowship-application";

export type FellowshipAdminApplication = {
  id: string;
  reference: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  candidateStatus: string;
  track: string;
  motivation: string;
  fullTime: boolean;
  vipassana: boolean;
  fieldWork: boolean;
  termsAccepted: boolean;
  cohort: string;
  stage: FellowshipApplicationStage;
  offerExpiresAt: string | null;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

export type FellowshipMentor = {
  id: string;
  name: string;
  email: string;
  phone: string;
  title: string;
  expertise: string;
  status: "active" | "inactive";
  notes: string;
  createdAt: string;
  updatedAt: string;
};

export type FellowshipInterviewPanelEntry = {
  id: string;
  name: string;
  email: string;
  role: string;
  token: string;
  submittedAt: string | null;
  motivationScore: number | null;
  commitmentScore: number | null;
  communicationScore: number | null;
  problemScore: number | null;
  fieldScore: number | null;
  fitScore: number | null;
  recommendation: string;
  notes: string;
  average: number | null;
};

export type FellowshipInterview = {
  id: string;
  applicationId: string;
  reference: string;
  candidateName: string;
  candidateEmail: string;
  track: string;
  cohort: string;
  scheduledAt: string;
  mode: string;
  location: string;
  meetingUrl: string;
  status: string;
  panel: FellowshipInterviewPanelEntry[];
  average: number | null;
};

export type FellowshipOnboarding = {
  id: string | null;
  applicationId: string;
  reference: string;
  name: string;
  email: string;
  track: string;
  cohort: string;
  stage: string;
  idVerified: boolean;
  educationVerified: boolean;
  emergencyContact: string;
  medicalNotes: string;
  codeOfConduct: boolean;
  poshAck: boolean;
  mediaConsent: boolean;
  deviceNeeds: string;
  baselineDone: boolean;
  vipassanaAck: boolean;
  notes: string;
  complete: boolean;
  completedItems: number;
  totalItems: number;
  updatedAt: string | null;
};

export type FellowshipAlumniRecord = {
  id: string;
  applicationId: string | null;
  name: string;
  email: string;
  cohort: string;
  track: string;
  destinationType: string;
  organisation: string;
  role: string;
  outcome6m: string;
  outcome12m: string;
  mentorWilling: boolean;
  testimonialConsent: boolean;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

export async function adminRequest<T>(
  url: string,
  init: RequestInit = {},
): Promise<T> {
  const response = await fetch(url, {
    credentials: "include",
    ...init,
  });
  const data = (await response.json().catch(() => null)) as
    | (T & { message?: string })
    | null;

  if (!response.ok || !data) {
    throw new Error(
      apiErrorMessage(data, "The request could not be completed."),
    );
  }

  return data;
}

export const jsonBody = (payload: unknown): RequestInit => ({
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(payload),
});

export const jsonPatch = (payload: unknown): RequestInit => ({
  method: "PATCH",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(payload),
});
