import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";

import { SendWhatsAppDto, UpdateWhatsAppSettingsDto } from "@/modules/whatsapp/dto/whatsapp.dto";

describe("SendWhatsAppDto", () => {
  it("accepts a phone number and message", async () => {
    const dto = plainToInstance(SendWhatsAppDto, {
      to: "919876543210",
      message: "Interview reminder",
    });
    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it("rejects a short phone number and empty message", async () => {
    const dto = plainToInstance(SendWhatsAppDto, { to: "123", message: "" });
    const errors = await validate(dto);
    expect(errors.some((error) => error.property === "to")).toBe(true);
    expect(errors.some((error) => error.property === "message")).toBe(true);
  });
});

describe("UpdateWhatsAppSettingsDto", () => {
  it("accepts enabled and a numeric country code", async () => {
    const dto = plainToInstance(UpdateWhatsAppSettingsDto, {
      enabled: true,
      countryCode: "91",
    });
    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it("rejects a non-numeric country code", async () => {
    const dto = plainToInstance(UpdateWhatsAppSettingsDto, {
      countryCode: "+91",
    });
    const errors = await validate(dto);
    expect(errors.some((error) => error.property === "countryCode")).toBe(true);
  });
});
