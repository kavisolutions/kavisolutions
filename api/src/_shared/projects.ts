import { ALLOWED_LIVE_LINK_TYPES } from "@/_shared/text";

export type LiveLinkType = "app" | "web" | "both";

export const isLiveLinkType = (value: string): value is LiveLinkType =>
  (ALLOWED_LIVE_LINK_TYPES as readonly string[]).includes(value);

export const validateLinks = (
  linkType: string,
  appLink: string,
  webLink: string,
): string | null => {
  if (linkType === "app" && !appLink) return "App link is required for App projects";
  if (linkType === "web" && !webLink) return "Web link is required for Web projects";
  if (linkType === "both" && !appLink) return "App link is required when Both is selected";
  if (linkType === "both" && !webLink) return "Web link is required when Both is selected";
  return null;
};
