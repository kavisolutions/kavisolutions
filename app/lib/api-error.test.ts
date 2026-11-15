import { describe, expect, it } from "vitest";

import { apiErrorMessage } from "./api-error";

describe("apiErrorMessage", () => {
  it("prefers the Nest message string", () => {
    expect(apiErrorMessage({ message: "Name cannot be empty", error: "Bad Request", statusCode: 400 }, "fallback")).toBe(
      "Name cannot be empty",
    );
  });

  it("joins validation message arrays", () => {
    expect(
      apiErrorMessage(
        { message: ["name must be a string", "name must be shorter than or equal to 120 characters"], error: "Bad Request", statusCode: 400 },
        "fallback",
      ),
    ).toBe("name must be a string, name must be shorter than or equal to 120 characters");
  });

  it("falls back when the body is missing or empty", () => {
    expect(apiErrorMessage(null, "fallback")).toBe("fallback");
    expect(apiErrorMessage({}, "fallback")).toBe("fallback");
    expect(apiErrorMessage({ error: "Forbidden" }, "fallback")).toBe("fallback");
  });
});
