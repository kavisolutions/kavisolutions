import type { Metadata } from "next";

import VerifyClient from "../verify-client";

export const metadata: Metadata = {
  title: "Verify a certificate | Kavi Solutions",
  description:
    "Confirm that a Kavi Solutions certificate is genuine. Enter the certificate ID printed on the document or scan its QR code.",
  robots: { index: false, follow: false },
};

export default async function VerifyIdPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <VerifyClient initialId={decodeURIComponent(id ?? "").slice(0, 64)} />;
}
