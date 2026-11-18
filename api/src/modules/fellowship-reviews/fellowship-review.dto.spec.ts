import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";

import {
  AssignFellowshipReviewDto,
  FellowshipReviewScorecardDto,
} from "@/modules/fellowship-reviews/dto/fellowship-review.dto";

describe("AssignFellowshipReviewDto", () => {
  it("accepts a reviewer assignment", async () => {
    const dto = plainToInstance(AssignFellowshipReviewDto, {
      applicationId: "app-1",
      reviewerName: "Reviewer",
      reviewerEmail: "reviewer@example.com",
      expiresInDays: 14,
    });
    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it("rejects a bad email and expiry outside 1-60", async () => {
    const dto = plainToInstance(AssignFellowshipReviewDto, {
      applicationId: "app-1",
      reviewerName: "Reviewer",
      reviewerEmail: "bad",
      expiresInDays: 90,
    });
    const errors = await validate(dto);
    expect(errors.some((error) => error.property === "reviewerEmail")).toBe(true);
    expect(errors.some((error) => error.property === "expiresInDays")).toBe(true);
  });
});

describe("FellowshipReviewScorecardDto", () => {
  it("accepts a complete review scorecard", async () => {
    const dto = plainToInstance(FellowshipReviewScorecardDto, {
      motivationScore: 4,
      commitmentScore: 4,
      communicationScore: 3,
      problemScore: 5,
      fieldScore: 4,
      fitScore: 4,
      recommendation: "offer",
      notes: "Good evidence.",
    });
    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it("rejects invalid scores and recommendation", async () => {
    const dto = plainToInstance(FellowshipReviewScorecardDto, {
      motivationScore: 6,
      commitmentScore: 0,
      communicationScore: 3,
      problemScore: 3,
      fieldScore: 3,
      fitScore: 3,
      recommendation: "maybe",
    });
    const errors = await validate(dto);
    expect(errors.some((error) => error.property === "motivationScore")).toBe(true);
    expect(errors.some((error) => error.property === "commitmentScore")).toBe(true);
    expect(errors.some((error) => error.property === "recommendation")).toBe(true);
  });
});
