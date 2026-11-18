/* Shared shape for client enquiries from the survey page. Mirrors
   api/src/modules/survey/survey.service.ts. */

export const SURVEY_ENQUIRY_STATUSES = ["new", "contacted", "closed", "archived"] as const;

export type SurveyEnquiryStatus = (typeof SURVEY_ENQUIRY_STATUSES)[number];

export const SURVEY_ENQUIRY_STATUS_LABELS: Record<SurveyEnquiryStatus, string> = {
  new: "New",
  contacted: "Contacted",
  closed: "Closed",
  archived: "Archived",
};

export const SURVEY_ENQUIRY_STATUS_TONES: Record<SurveyEnquiryStatus, string> = {
  new: "border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-400",
  contacted: "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  closed: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  archived: "border-border bg-muted text-muted-foreground",
};

export type SurveyEnquiry = {
  id: string;
  name: string;
  email: string;
  phone: string;
  organisation: string;
  service: string;
  message: string;
  status: SurveyEnquiryStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
};
