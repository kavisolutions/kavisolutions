import { NotFoundException } from "@nestjs/common";

/* The decorators re-export metadata keys from the auth guard, which imports
   better-auth's ESM-only build. This unit test only needs the no-op decorators. */
jest.mock("@/auth/auth.decorators", () => ({
  Public: () => () => undefined,
  AdminOnly: () => () => undefined,
  OptionalAuth: () => () => undefined,
}));

import { CertificatesController } from "@/modules/certificates/certificates.controller";
import type { CertificatesService } from "@/modules/certificates/certificates.service";

const certificate = {
  id: "KV-FEL-2026-0001",
  type: "fellowship" as const,
  title: "Certificate of Fellowship Completion",
  recipient: "Aarav Krishna Reddy",
  programme: null,
  role: null,
  startDate: null,
  endDate: null,
  issuedOn: "2026-04-10",
  summary: null,
  status: "issued" as const,
};

const buildController = () => {
  const service = {
    verify: jest.fn(async (id: string) => (id === certificate.id ? certificate : null)),
  };
  const controller = new CertificatesController(service as unknown as CertificatesService);
  return { controller, service };
};

describe("CertificatesController.verify", () => {
  it("looks up a well-formed id", async () => {
    const { controller, service } = buildController();

    await expect(controller.verify("KV-FEL-2026-0001")).resolves.toEqual({ certificate });
    expect(service.verify).toHaveBeenCalledWith("KV-FEL-2026-0001");
  });

  /* Express hands the handler an already-decoded segment. Decoding a second
     time used to throw on a literal "%" and return a 500. */
  it("404s on a value that is not a certificate id instead of throwing", async () => {
    const { controller, service } = buildController();

    await expect(controller.verify("%")).rejects.toBeInstanceOf(NotFoundException);
    await expect(controller.verify("not-an-id")).rejects.toBeInstanceOf(NotFoundException);
    expect(service.verify).not.toHaveBeenCalled();
  });

  it("404s when the id is well-formed but unknown", async () => {
    const { controller } = buildController();
    await expect(controller.verify("KV-FEL-2026-4242")).rejects.toBeInstanceOf(NotFoundException);
  });
});
