import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";

import { CreateFellowshipCaseDto } from "@/modules/fellowship-cases/dto/fellowship-case.dto";
import { CreateFellowshipDeliveryReviewDto } from "@/modules/fellowship-delivery/dto/fellowship-delivery.dto";
import { UpsertFellowshipEmailTemplateDto } from "@/modules/fellowship-templates/dto/fellowship-template.dto";

describe("CreateFellowshipDeliveryReviewDto", () => {
  it("accepts a weekly review with an at-risk flag", async () => {
    const dto = plainToInstance(CreateFellowshipDeliveryReviewDto, {
      applicationId: "app-1",
      type: "weekly",
      phase: "Craft",
      week: 4,
      reviewerName: "Mentor",
      reviewerEmail: "mentor@example.com",
      attendancePercent: 90,
      deliverableScore: 4,
      collaborationScore: 4,
      fieldScore: 5,
      atRisk: true,
      riskNotes: "Travel support",
    });
    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it("rejects invalid type, attendance and scores", async () => {
    const dto = plainToInstance(CreateFellowshipDeliveryReviewDto, {
      applicationId: "app-1",
      type: "daily",
      attendancePercent: 140,
      deliverableScore: 9,
    });
    const errors = await validate(dto);
    expect(errors.some((error) => error.property === "type")).toBe(true);
    expect(errors.some((error) => error.property === "attendancePercent")).toBe(true);
    expect(errors.some((error) => error.property === "deliverableScore")).toBe(true);
  });
});

describe("CreateFellowshipCaseDto", () => {
  it("accepts a confidential case", async () => {
    const dto = plainToInstance(CreateFellowshipCaseDto, {
      category: "posh",
      severity: "high",
      summary: "Confidential report",
      details: "Restricted details",
      assignedTo: "Case owner",
    });
    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it("rejects invalid category and severity", async () => {
    const dto = plainToInstance(CreateFellowshipCaseDto, {
      category: "gossip",
      severity: "urgent",
      summary: "Short",
    });
    const errors = await validate(dto);
    expect(errors.some((error) => error.property === "category")).toBe(true);
    expect(errors.some((error) => error.property === "severity")).toBe(true);
  });
});

describe("UpsertFellowshipEmailTemplateDto", () => {
  it("accepts subject and body", async () => {
    const dto = plainToInstance(UpsertFellowshipEmailTemplateDto, {
      subject: "Status update — {{reference}}",
      body: "Hello {{name}},",
    });
    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it("rejects empty copy", async () => {
    const dto = plainToInstance(UpsertFellowshipEmailTemplateDto, {
      subject: "",
      body: "",
    });
    const errors = await validate(dto);
    expect(errors.some((error) => error.property === "subject")).toBe(true);
    expect(errors.some((error) => error.property === "body")).toBe(true);
  });
});
