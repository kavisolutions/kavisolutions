import { BadRequestException, ServiceUnavailableException } from "@nestjs/common";

import { SurveyController } from "@/modules/survey/survey.controller";
import type { SettingsService } from "@/modules/settings/settings.service";

jest.mock("@/auth/auth.decorators", () => ({
  Public: () => () => undefined,
  AdminOnly: () => () => undefined,
  OptionalAuth: () => () => undefined,
}));

jest.mock("@/_shared/mailer", () => ({
  sendSurveyEnquiryEmail: jest.fn(),
}));

import { sendSurveyEnquiryEmail } from "@/_shared/mailer";

const mockedSend = sendSurveyEnquiryEmail as jest.MockedFunction<typeof sendSurveyEnquiryEmail>;

const build = () => {
  const settings = {
    contactEmail: jest.fn(async () => "support@kavisolutions.in"),
    surveyOpportunities: jest.fn(async () => []),
  };
  const service = {
    createClient: jest.fn(async () => ({ id: "enquiry-1" })),
  };
  const leads = {
    captureBestEffort: jest.fn(async () => undefined),
  };
  const controller = new SurveyController(
    settings as unknown as SettingsService,
    service as never,
    leads as never,
  );
  return { controller, settings, service, leads };
};

const client = {
  kind: "client" as const,
  name: "Ashok",
  email: "ashok@example.com",
  phone: "+919999900000",
  organisation: "Kavi Solutions",
  service: "Market & brand research",
  message: "Brand perception study across three districts.",
};

describe("SurveyController.enquiry", () => {
  beforeEach(() => mockedSend.mockReset());

  it("stores and emails a client enquiry", async () => {
    mockedSend.mockResolvedValue(undefined);
    const { controller, service } = build();

    await expect(controller.enquiry(client)).resolves.toEqual({ success: true });
    expect(service.createClient).toHaveBeenCalledWith(client);
    expect(mockedSend).toHaveBeenCalledWith(
      expect.objectContaining({ kind: "client", to: "support@kavisolutions.in" }),
    );
  });

  it("trims whitespace from submitted fields", async () => {
    mockedSend.mockResolvedValue(undefined);
    const { controller } = build();

    await controller.enquiry({ ...client, name: "  Ashok  ", email: " a@b.co " });

    expect(mockedSend).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Ashok", email: "a@b.co" }),
    );
  });

  /* Surveyor-only fields on a client enquiry would silently drop data from the
     email, so the mismatch is rejected instead. */
  it("rejects surveyor fields on a client enquiry", async () => {
    const { controller } = build();

    await expect(
      controller.enquiry({ ...client, location: "Warangal" }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(mockedSend).not.toHaveBeenCalled();
  });

  it("rejects client fields on a surveyor registration", async () => {
    const { controller } = build();

    await expect(
      controller.enquiry({
        kind: "surveyor",
        name: "Ravi",
        email: "ravi@example.com",
        phone: "+918888800000",
        service: "Market research",
        message: "Available for fieldwork in Warangal.",
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(mockedSend).not.toHaveBeenCalled();
  });

  it("rejects a blank required field after trimming", async () => {
    const { controller } = build();

    await expect(controller.enquiry({ ...client, name: "   " })).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  /* A stored lead is not a failed submission just because SMTP is down. */
  it("returns success when mail fails but the enquiry was stored", async () => {
    mockedSend.mockRejectedValue(new Error("530 Authentication Required"));
    const { controller } = build();

    await expect(controller.enquiry(client)).resolves.toEqual({
      success: true,
      notified: false,
    });
  });

  /* If neither storage nor mail worked, the visitor gets a 503 fallback. */
  it("returns 503 when storage and mail both fail", async () => {
    mockedSend.mockRejectedValue(new Error("530 Authentication Required"));
    const { controller, service } = build();
    service.createClient.mockRejectedValueOnce(new Error("database down"));

    await expect(controller.enquiry(client)).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
});
