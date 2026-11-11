import { Transform } from "class-transformer";
import { IsIn, IsISO8601, IsOptional, IsString, Matches, MaxLength } from "class-validator";

import { CERTIFICATE_TYPES } from "@/_shared/certificates";

/* Certificate IDs are printed uppercase and the public lookup normalises them,
   so admin payloads accept any casing too instead of failing validation. */
const NormalizeId = () =>
  Transform(({ value }) => (typeof value === "string" ? value.trim().toUpperCase() : value));

/* `YYYY-MM-DD` plus a real calendar date — the regex alone would accept
   2026-02-31 and print "31 February" on the certificate. */
const IsCalendarDate = () => IsISO8601({ strict: true });

/* Admin payload for recording an issued certificate. The certificate itself is
   generated offline from the certificates/ library; the API only keeps the
   record that makes /verify/<id> work. */
export class CreateCertificateDto {
  @NormalizeId()
  @IsString()
  @Matches(/^KV-(FEL|VOL|INT|MEN|EXP)-\d{4}-\d{4}$/)
  id!: string;

  @IsIn(CERTIFICATE_TYPES)
  type!: string;

  @IsString()
  @MaxLength(160)
  recipientName!: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  programme?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  role?: string;

  @IsOptional()
  @IsString()
  @IsCalendarDate()
  startDate?: string;

  @IsOptional()
  @IsString()
  @IsCalendarDate()
  endDate?: string;

  @IsString()
  @IsCalendarDate()
  issuedOn!: string;

  @IsOptional()
  @IsString()
  @MaxLength(600)
  summary?: string;
}

export class RevokeCertificateDto {
  @NormalizeId()
  @IsString()
  @Matches(/^KV-(FEL|VOL|INT|MEN|EXP)-\d{4}-\d{4}$/)
  id!: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  reason?: string;
}

/* Brings a revoked certificate back to "issued". Kept as its own action so
   re-recording a certificate (create/upsert) can never silently un-revoke it. */
export class ReinstateCertificateDto {
  @NormalizeId()
  @IsString()
  @Matches(/^KV-(FEL|VOL|INT|MEN|EXP)-\d{4}-\d{4}$/)
  id!: string;
}

/* Shared payload for the actions that only need to identify a certificate. */
export class CertificateIdDto {
  @NormalizeId()
  @IsString()
  @Matches(/^KV-(FEL|VOL|INT|MEN|EXP)-\d{4}-\d{4}$/)
  id!: string;
}
