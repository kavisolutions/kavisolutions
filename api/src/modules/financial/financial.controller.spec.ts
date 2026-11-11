import { BadRequestException, ServiceUnavailableException } from "@nestjs/common";

import { FinancialController } from "@/modules/financial/financial.controller";
import type { SettingsService } from "@/modules/settings/settings.service";

jest.mock("@/auth/auth.decorators", () => ({
  Public: () => () => undefined,
  AdminOnly: () => () => undefined,
  OptionalAuth: () => () => undefined,
}));

jest.mock("@/_shared/mailer", () => ({
  sendFinancialEnquiryEmail: jest.fn(),
}));

import { sendFinancialEnquiryEmail } from "@/_shared/mailer";

const mockedSend = sendFinancialEnquiryEmail as jest.MockedFunction<
  typeof sendFinancialEnquiryEmail
>;

const build = () => {
  const settings = { contactEmail: jest.fn(async () => "finance@kavisolutions.in") };
  return {
    controller: new FinancialController(settings as unknown as SettingsService),
    settings,
  };
};

const individual = {
  kind: "individual" as const,
  name: "Ashok Sandhyala",
  email: "ashok@example.com",
  phone: "+919999900000",
  service: "ITR filing",
  financialYear: "2026-27",
  message: "Need help filing my return and planning for next year.",
};

const business = {
  kind: "business" as const,
  name: "Ravi Kumar",
  email: "ravi@example.com",
  phone: "+918888800000",
  organisation: "Kavi Labs Pvt Ltd",
  entityType: "Private Limited",
  service: "Accounting & bookkeeping",
  message: "Monthly bookkeeping and quarterly reporting for our company.",
};

describe("FinancialController.enquiry", () => {
  beforeEach(() => mockedSend.mockReset());

  it("sends an individual enquiry", async () => {
    mockedSend.mockResolvedValue(undefined);
    const { controller } = build();

    await expect(controller.enquiry(individual)).resolves.toEqual({ success: true });
    expect(mockedSend).toHaveBeenCalledWith(
      expect.objectContaining({ kind: "individual", to: "finance@kavisolutions.in" }),
    );
  });

  it("sends a business enquiry", async () => {
    mockedSend.mockResolvedValue(undefined);
    const { controller } = build();

    await controller.enquiry(business);

    expect(mockedSend).toHaveBeenCalledWith(
      expect.objectContaining({ organisation: "Kavi Labs Pvt Ltd", entityType: "Private Limited" }),
    );
  });

  it("trims submitted fields", async () => {
    mockedSend.mockResolvedValue(undefined);
    const { controller } = build();

    await controller.enquiry({ ...individual, name: "  Ashok  " });

    expect(mockedSend).toHaveBeenCalledWith(expect.objectContaining({ name: "Ashok" }));
  });

  /* Business-only fields on an individual enquiry would be dropped from the
     email, so the mismatch is rejected instead of silently losing data. */
  it("rejects business fields on an individual enquiry", async () => {
    const { controller } = build();

    await expect(
      controller.enquiry({ ...individual, organisation: "Acme" }),
    ).rejects.toBeInstanceOf(BadRequestException);
    await expect(
      controller.enquiry({ ...individual, entityType: "LLP" }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(mockedSend).not.toHaveBeenCalled();
  });

  it("rejects an individual field on a business enquiry", async () => {
    const { controller } = build();

    await expect(
      controller.enquiry({ ...business, financialYear: "2026-27" }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(mockedSend).not.toHaveBeenCalled();
  });

  it("rejects a blank required field after trimming", async () => {
    const { controller } = build();

    await expect(controller.enquiry({ ...individual, message: "   " })).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it("returns 503 when mail delivery fails", async () => {
    mockedSend.mockRejectedValue(new Error("530 Authentication Required"));
    const { controller } = build();

    await expect(controller.enquiry(individual)).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });
});
