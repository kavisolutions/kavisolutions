"use client";

import { useSupportEmail } from "@/lib/support-email";

/* Lets server-rendered pages show the admin-managed support address without
   becoming client components themselves. */
export function SupportText({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const email = useSupportEmail();
  return (
    <span className={className}>
      {text.replaceAll("support@kavisolutions.in", email)}
    </span>
  );
}

export default function SupportEmail({
  href = false,
  subject,
  className,
}: {
  href?: boolean;
  subject?: string;
  className?: string;
}) {
  const email = useSupportEmail();
  return href ? (
    <a
      href={`mailto:${email}${subject ? `?subject=${encodeURIComponent(subject)}` : ""}`}
      className={className}
    >
      {email}
    </a>
  ) : (
    <span className={className}>{email}</span>
  );
}
