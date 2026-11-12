import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";

import { UpdatePagesDto } from "@/modules/pages/dto/update-pages.dto";

const errorsFor = async (value: object) => {
  const dto = plainToInstance(UpdatePagesDto, value);
  return validate(dto);
};

describe("UpdatePagesDto", () => {
  it("accepts a single switch", async () => {
    await expect(errorsFor({ survey: true })).resolves.toHaveLength(0);
  });

  it("accepts multiple switches", async () => {
    await expect(
      errorsFor({ survey: false, financial: true, government: false, farms: true }),
    ).resolves.toHaveLength(0);
  });

  /* JSON clients sometimes send "true"/"false" strings. They are rejected so
     the stored value can only ever be the literal the reader expects. */
  it("rejects string values", async () => {
    const errors = await errorsFor({ survey: "true" });
    expect(errors.some((error) => error.property === "survey")).toBe(true);
  });

  it("rejects numeric values", async () => {
    const errors = await errorsFor({ financial: 1 });
    expect(errors.some((error) => error.property === "financial")).toBe(true);
  });
});
