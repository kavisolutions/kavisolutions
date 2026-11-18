import { parseSurveyOpportunities } from "@/modules/settings/settings.service";

describe("parseSurveyOpportunities", () => {
  it("splits names and notes on the first pipe", () => {
    expect(parseSurveyOpportunities("IFMR | Research institution\nGHMC | Municipal body")).toEqual([
      { name: "IFMR", note: "Research institution" },
      { name: "GHMC", note: "Municipal body" },
    ]);
  });

  it("keeps notes that contain a pipe", () => {
    expect(parseSurveyOpportunities("Metro Card | Transit | data collection")).toEqual([
      { name: "Metro Card", note: "Transit | data collection" },
    ]);
  });

  it("drops blank lines and unnamed entries", () => {
    expect(parseSurveyOpportunities("\n | orphan note\nDishTV | consumer research\n")).toEqual([
      { name: "DishTV", note: "consumer research" },
    ]);
  });

  it("accepts a missing setting", () => {
    expect(parseSurveyOpportunities(undefined)).toEqual([]);
    expect(parseSurveyOpportunities(null)).toEqual([]);
  });
});
