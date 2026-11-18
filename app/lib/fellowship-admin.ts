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
  offerReminderSentAt: string | null;
  waitlistPosition: number | null;
  waitlistExpiresAt: string | null;
  completedAt: string | null;
  candidateToken: string | null;
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
  portalToken: string;
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
  mentorId: string | null;
  portalToken: string | null;
  tokenExpiresAt: string | null;
  revokedAt: string | null;
  lastSentAt: string | null;
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
  candidateToken: string;
  candidateConfirmedAt: string | null;
  rescheduleRequestedAt: string | null;
  rescheduleNote: string;
  reminderSentAt: string | null;
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
  accommodationNotes: string;
  travelNotes: string;
  foodNotes: string;
  arrivalAt: string | null;
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
  followUpDueAt: string | null;
  followUpSentAt: string | null;
  publicStory: string;
  storyPublished: boolean;
  updateToken: string;
  verifiedAt: string | null;
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

export type FellowshipReview = {
  id: string;
  applicationId: string;
  reference: string;
  candidateName: string;
  candidateEmail: string;
  track: string;
  cohort: string;
  reviewerName: string;
  reviewerEmail: string;
  role: string;
  token: string;
  motivationScore: number | null;
  commitmentScore: number | null;
  communicationScore: number | null;
  problemScore: number | null;
  fieldScore: number | null;
  fitScore: number | null;
  recommendation: string;
  notes: string;
  average: number | null;
  tokenExpiresAt: string | null;
  revokedAt: string | null;
  submittedAt: string | null;
  createdAt: string;
};

export type FellowshipDeliveryReview = {
  id: string;
  applicationId: string;
  reference: string;
  candidateName: string;
  candidateEmail: string;
  track: string;
  cohort: string;
  type: string;
  phase: string;
  week: number | null;
  reviewerName: string;
  reviewerEmail: string;
  attendancePercent: number | null;
  deliverableScore: number | null;
  collaborationScore: number | null;
  fieldScore: number | null;
  notes: string;
  atRisk: boolean;
  riskNotes: string;
  createdAt: string;
  updatedAt: string;
};

export type FellowshipDocument = {
  id: string;
  applicationId: string;
  type: string;
  name: string;
  mimeType: string;
  size: number;
  status: string;
  notes: string;
  uploadedBy: string;
  verifiedAt: string | null;
  createdAt: string;
};

export type FellowshipCase = {
  id: string;
  applicationId: string | null;
  candidateName: string;
  candidateReference: string;
  category: string;
  severity: string;
  summary: string;
  details: string;
  status: string;
  assignedTo: string;
  resolution: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
};

export type FellowshipDashboard = {
  applications: {
    total: number;
    stages: Record<string, number>;
    interviewRate: number;
    offerRate: number;
    completionRate: number;
  };
  interviews: {
    scheduled: number;
    upcoming: number;
    nextSevenDays: number;
    completed: number;
  };
  reviews: { pending: number; assigned: number };
  delivery: { atRisk: number };
  cases: { open: number };
  offers: { expiringSoon: number };
  waitlist: { active: number };
  alumni: {
    total: number;
    mentorWilling: number;
    published: number;
    destinations: Record<string, number>;
  };
};

export type FellowshipAuditEntry = {
  id: string;
  actorEmail: string;
  action: string;
  entityType: string;
  entityId: string;
  applicationId: string | null;
  detail: string;
  createdAt: string;
};

export type FellowshipEmailTemplate = {
  key: string;
  subject: string;
  body: string;
  updatedAt: string;
};
