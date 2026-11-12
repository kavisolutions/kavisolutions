import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";

import { CreateFarmsEnquiryDto } from "@/modules/farms/dto/farms-enquiry.dto";

const errorsFor = async (value: object) => {
  const dto = plainToInstance(CreateFarmsEnquiryDto, value);
  return validate(dto);
};

const valid = {
  kind: "product",
  name: "Ashok Sandhyala",
  email: "ashok@example.com",
  phone: "+919999900000",
  product: "Sona Masuri rice",
  quantity: "10 kg",
  message: "Please confirm availability and delivery to Hyderabad.",
};

describe("CreateFarmsEnquiryDto", () => {
  it("accepts a product enquiry", async () => {
    await expect(errorsFor(valid)).resolves.toHaveLength(0);
  });

  it("accepts a tourism enquiry", async () => {
    await expect(
      errorsFor({
        ...valid,
        kind: "tourism",
        product: undefined,
        quantity: undefined,
        service: "Weekend village experience",
        travelMonth: "January",
        groupSize: "4",
      }),
    ).resolves.toHaveLength(0);
  });

  it("rejects an unknown kind", async () => {
    const errors = await errorsFor({ ...valid, kind: "booking" });
    expect(errors.some((e) => e.property === "kind")).toBe(true);
  });

  it("requires a valid email", async () => {
    const errors = await errorsFor({ ...valid, email: "nope" });
    expect(errors.some((e) => e.property === "email")).toBe(true);
  });

  it("caps the message length", async () => {
    const errors = await errorsFor({ ...valid, message: "x".repeat(2001) });
    expect(errors.some((e) => e.property === "message")).toBe(true);
  });
});
