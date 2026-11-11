import type { Metadata } from "next";

import VerifyClient from "./verify-client";

export const metadata: Metadata = {
  title: "Verify a certificate | Kavi Solutions",
  description:
    "Confirm that a Kavi Solutions certificate is genuine. Enter the certificate ID printed on the document or scan its QR code.",
  robots: { index: true, follow: true },
};

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string | string[] }>;
}) {
  const params = await searchParams;
  const raw = Array.isArray(params.id) ? params.id[0] : params.id;
  const initialId = typeof raw === "string" ? raw.slice(0, 64) : "";

  return <VerifyClient initialId={initialId} />;
}
