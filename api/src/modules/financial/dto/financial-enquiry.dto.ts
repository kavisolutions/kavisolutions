import { IsEmail, IsIn, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

/* Two enquiry tracks share one endpoint: an individual and a business. The
   controller rejects fields from the wrong track so a mixed payload cannot
   silently drop data from the notification email. */
export class CreateFinancialEnquiryDto {
  @IsIn(["individual", "business"])
  kind!: "individual" | "business";

  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name!: string;

  @IsEmail()
  @MaxLength(200)
  email!: string;

  @IsString()
  @MinLength(6)
  @MaxLength(30)
  phone!: string;

  /** Business track only. */
  @IsOptional()
  @IsString()
  @MaxLength(160)
  organisation?: string;

  /** Business track only. */
  @IsOptional()
  @IsString()
  @MaxLength(60)
  entityType?: string;

  /** The service the enquirer is interested in, from the page's dropdown. */
  @IsOptional()
  @IsString()
  @MaxLength(120)
  service?: string;

  /** Individual track only: financial year the enquiry relates to. */
  @IsOptional()
  @IsString()
  @MaxLength(20)
  financialYear?: string;

  @IsString()
  @MinLength(10)
  @MaxLength(2000)
  message!: string;
}
