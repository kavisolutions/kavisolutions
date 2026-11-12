import { BadRequestException, ServiceUnavailableException } from "@nestjs/common";

import { GovernmentController } from "@/modules/government/government.controller";
import type { SettingsService } from "@/modules/settings/settings.service";

jest.mock("@/auth/auth.decorators", () => ({
  Public: () => () => undefined,
  AdminOnly: () => () => undefined,
  OptionalAuth: () => () => undefined,
}));

jest.mock("@/_shared/mailer", () => ({
  sendGovernmentEnquiryEmail: jest.fn(),
}));

import { sendGovernmentEnquiryEmail } from "@/_shared/mailer";

const mockedSend = sendGovernmentEnquiryEmail as jest.MockedFunction<
  typeof sendGovernmentEnquiryEmail
>;

const build = () => {
  const settings = { contactEmail: jest.fn(async () => "gov@kavisolutions.in") };
  return {
    controller: new GovernmentController(settings as unknown as SettingsService),
    settings,
  };
};

const valid = {
  name: "Ashok Sandhyala",
  email: "ashok@example.gov.in",
  phone: "+919999900000",
  organisation: "Department of Technical Education",
  role: "Government department",
  portal: "https://example.gov.in",
  service: "Examination or admission portal",
  message: "We need an assessment of the counselling and allotment journey.",
};

describe("GovernmentController.enquiry", () => {
  beforeEach(() => mockedSend.mockReset());

  it("sends a government enquiry", async () => {
    mockedSend.mockResolvedValue(undefined);
    const { controller } = build();

    await expect(controller.enquiry(valid)).resolves.toEqual({ success: true });
    expect(mockedSend).toHaveBeenCalledWith(
      expect.objectContaining({
        organisation: "Department of Technical Education",
        to: "gov@kavisolutions.in",
      }),
    );
  });

  it("trims submitted fields", async () => {
    mockedSend.mockResolvedValue(undefined);
    const { controller } = build();

    await controller.enquiry({ ...valid, name: "  Ashok  " });

    expect(mockedSend).toHaveBeenCalledWith(expect.objectContaining({ name: "Ashok" }));
  });

  it("rejects a blank required field after trimming", async () => {
    const { controller } = build();

    await expect(controller.enquiry({ ...valid, organisation: "   " })).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it("returns 503 when mail delivery fails", async () => {
    mockedSend.mockRejectedValue(new Error("530 Authentication Required"));
    const { controller } = build();

    await expect(controller.enquiry(valid)).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });
});
