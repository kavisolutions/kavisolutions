import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

/* Public government-modernisation enquiry. No documents, citizen data or
   credentials belong here; the form is a first contact channel only. */
export class CreateGovernmentEnquiryDto {
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

  @IsString()
  @MinLength(2)
  @MaxLength(200)
  organisation!: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  role?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  portal?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  service?: string;

  @IsString()
  @MinLength(10)
  @MaxLength(2000)
  message!: string;
}
