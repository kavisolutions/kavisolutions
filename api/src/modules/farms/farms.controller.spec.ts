import { BadRequestException, ServiceUnavailableException } from "@nestjs/common";

import { FarmsController } from "@/modules/farms/farms.controller";
import type { SettingsService } from "@/modules/settings/settings.service";

jest.mock("@/auth/auth.decorators", () => ({
  Public: () => () => undefined,
  AdminOnly: () => () => undefined,
  OptionalAuth: () => () => undefined,
}));

jest.mock("@/_shared/mailer", () => ({
  sendFarmsEnquiryEmail: jest.fn(),
}));

import { sendFarmsEnquiryEmail } from "@/_shared/mailer";

const mockedSend = sendFarmsEnquiryEmail as jest.MockedFunction<
  typeof sendFarmsEnquiryEmail
>;

const build = () => {
  const settings = { contactEmail: jest.fn(async () => "farms@kavisolutions.in") };
  return {
    controller: new FarmsController(settings as unknown as SettingsService),
    settings,
  };
};

const product = {
  kind: "product" as const,
  name: "Ashok Sandhyala",
  email: "ashok@example.com",
  phone: "+919999900000",
  product: "Sona Masuri rice",
  quantity: "10 kg",
  message: "Please confirm availability and delivery to Hyderabad.",
};

const tourism = {
  kind: "tourism" as const,
  name: "Ravi Kumar",
  email: "ravi@example.com",
  phone: "+918888800000",
  service: "Weekend village experience",
  travelMonth: "January",
  groupSize: "4",
  message: "We are a family of four looking for a weekend in January.",
};

describe("FarmsController.enquiry", () => {
  beforeEach(() => mockedSend.mockReset());

  it("sends a product enquiry", async () => {
    mockedSend.mockResolvedValue(undefined);
    const { controller } = build();

    await expect(controller.enquiry(product)).resolves.toEqual({ success: true });
    expect(mockedSend).toHaveBeenCalledWith(
      expect.objectContaining({ kind: "product", to: "farms@kavisolutions.in" }),
    );
  });

  it("sends a tourism enquiry", async () => {
    mockedSend.mockResolvedValue(undefined);
    const { controller } = build();

    await controller.enquiry(tourism);

    expect(mockedSend).toHaveBeenCalledWith(
      expect.objectContaining({ kind: "tourism", groupSize: "4" }),
    );
  });

  it("rejects tourism fields on a product enquiry", async () => {
    const { controller } = build();

    await expect(
      controller.enquiry({ ...product, travelMonth: "January" }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(mockedSend).not.toHaveBeenCalled();
  });

  it("rejects product fields on a tourism enquiry", async () => {
    const { controller } = build();

    await expect(
      controller.enquiry({ ...tourism, product: "Sona Masuri rice" }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(mockedSend).not.toHaveBeenCalled();
  });

  it("rejects a blank required field after trimming", async () => {
    const { controller } = build();

    await expect(controller.enquiry({ ...product, message: "   " })).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it("returns 503 when mail delivery fails", async () => {
    mockedSend.mockRejectedValue(new Error("530 Authentication Required"));
    const { controller } = build();

    await expect(controller.enquiry(product)).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });
});
