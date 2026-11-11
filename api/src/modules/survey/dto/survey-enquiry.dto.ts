import { IsEmail, IsIn, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

/* Two forms share one endpoint: a client/project enquiry and a surveyor
   registration. `kind` decides which optional fields are meaningful; the
   controller validates that pairing so a client form cannot smuggle in
   surveyor-only fields and vice versa. */
export class CreateSurveyEnquiryDto {
  @IsIn(["client", "surveyor"])
  kind!: "client" | "surveyor";

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

  @IsOptional()
  @IsString()
  @MaxLength(160)
  organisation?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  service?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  location?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  languages?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  experience?: string;

  @IsString()
  @MinLength(10)
  @MaxLength(2000)
  message!: string;
}
