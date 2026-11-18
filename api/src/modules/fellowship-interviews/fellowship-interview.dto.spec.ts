import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";

import {
  CreateFellowshipInterviewDto,
  FellowshipScorecardDto,
} from "@/modules/fellowship-interviews/dto/fellowship-interview.dto";

const validScorecard = {
  motivationScore: 4,
  commitmentScore: 5,
  communicationScore: 3,
  problemScore: 4,
  fieldScore: 4,
  fitScore: 3,
  recommendation: "offer",
  notes: "Clear evidence from the interview.",
};

const errorsFor = async (value: object) => {
  const dto = plainToInstance(FellowshipScorecardDto, value);
  return validate(dto);
};

describe("FellowshipScorecardDto", () => {
  it("accepts a complete scorecard", async () => {
    await expect(errorsFor(validScorecard)).resolves.toHaveLength(0);
  });

  it("rejects scores outside 1 to 5", async () => {
    for (const [field, value] of [
      ["motivationScore", 0],
      ["problemScore", 6],
      ["fitScore", -1],
    ] as const) {
      const errors = await errorsFor({ ...validScorecard, [field]: value });
      expect(errors.some((error) => error.property === field)).toBe(true);
    }
  });

  it("requires a known recommendation", async () => {
    const errors = await errorsFor({
      ...validScorecard,
      recommendation: "maybe",
    });
    expect(errors.some((error) => error.property === "recommendation")).toBe(true);

    for (const recommendation of ["offer", "waitlist", "reject"]) {
      await expect(
        errorsFor({ ...validScorecard, recommendation }),
      ).resolves.toHaveLength(0);
    }
  });
});

describe("CreateFellowshipInterviewDto", () => {
  it("accepts a scheduled online interview", async () => {
    const dto = plainToInstance(CreateFellowshipInterviewDto, {
      applicationId: "3f5a1b6c-4c7a-4a6e-9f61-1d2c3b4a5e6f",
      scheduledAt: "2027-01-12T10:00:00.000Z",
      mode: "online",
      meetingUrl: "https://meet.example.com/interview",
      mentorIds: ["mentor-1"],
      adminEmails: ["admin@example.com"],
    });
    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it("rejects invalid mode and admin emails", async () => {
    const dto = plainToInstance(CreateFellowshipInterviewDto, {
      applicationId: "3f5a1b6c-4c7a-4a6e-9f61-1d2c3b4a5e6f",
      scheduledAt: "not-a-date",
      mode: "telepathy",
      adminEmails: ["bad"],
    });
    const errors = await validate(dto);
    expect(errors.some((error) => error.property === "scheduledAt")).toBe(true);
    expect(errors.some((error) => error.property === "mode")).toBe(true);
    expect(errors.some((error) => error.property === "adminEmails")).toBe(true);
  });
});
