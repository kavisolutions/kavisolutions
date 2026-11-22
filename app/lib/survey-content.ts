import defaultContent from "./survey-content-default.json";

export type SurveyMetric = { value: string; label: string };

export type SurveyVertical = {
  slug?: string;
  icon?: string;
  tag: string;
  title: string;
  summary: string;
  services: string[];
};

export type SurveyContent = {
  brand: {
    name: string;
    vertical: string;
    contactEmail: string;
    contactName: string;
    location: string;
  };
  hero: {
    eyebrow: string;
    title: string;
    highlight: string;
    description: string;
    metrics: SurveyMetric[];
  };
  verticals: SurveyVertical[];
  approach: { step: string; title: string; summary: string }[];
  engagement: { title: string; summary: string; bestFor: string }[];
  sampleProjects: { tag: string; title: string; desc: string }[];
  previousWork: { name: string; note: string }[];
  sectors: string[];
  faqs: { q: string; a: string }[];
};

export type SurveyVerticalDraft = {
  index: number | null;
  icon: string;
  tag: string;
  title: string;
  summary: string;
  servicesText: string;
};

export const DEFAULT_SURVEY_CONTENT = defaultContent as SurveyContent;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const isVertical = (value: unknown): value is SurveyVertical =>
  isRecord(value) &&
  typeof value.tag === "string" &&
  typeof value.title === "string" &&
  typeof value.summary === "string" &&
  Array.isArray(value.services) &&
  value.services.every((service) => typeof service === "string");

export const isSurveyContent = (value: unknown): value is SurveyContent => {
  if (!isRecord(value)) return false;

  return (
    isRecord(value.brand) &&
    isRecord(value.hero) &&
    Array.isArray(value.verticals) &&
    value.verticals.every(isVertical) &&
    Array.isArray(value.approach) &&
    Array.isArray(value.engagement) &&
    Array.isArray(value.sampleProjects) &&
    Array.isArray(value.previousWork) &&
    Array.isArray(value.sectors) &&
    Array.isArray(value.faqs)
  );
};

export const emptySurveyVertical = (): SurveyVerticalDraft => ({
  index: null,
  icon: "🧭",
  tag: "",
  title: "",
  summary: "",
  servicesText: "",
});

export const toSurveyVerticalDraft = (
  vertical: SurveyVertical,
  index: number,
): SurveyVerticalDraft => ({
  index,
  icon: vertical.icon ?? "",
  tag: vertical.tag,
  title: vertical.title,
  summary: vertical.summary,
  servicesText: vertical.services.join("\n"),
});

export const fromSurveyVerticalDraft = (
  draft: SurveyVerticalDraft,
  existing?: SurveyVertical,
): SurveyVertical => ({
  ...existing,
  slug: existing?.slug,
  icon: draft.icon.trim() || undefined,
  tag: draft.tag.trim(),
  title: draft.title.trim(),
  summary: draft.summary.trim(),
  services: draft.servicesText
    .split("\n")
    .map((service) => service.trim())
    .filter(Boolean),
});

/* Keep the hero tile in step when a service is added or removed. */
export const withSurveyVerticalCount = (content: SurveyContent): SurveyContent => {
  const count = content.verticals.length;
  const metrics = content.hero.metrics.map((metric) =>
    metric.label.toLowerCase().includes("research vertical")
      ? { ...metric, value: String(count) }
      : metric,
  );

  return { ...content, hero: { ...content.hero, metrics } };
};
