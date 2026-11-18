import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";

export class CreateFellowshipAlumniDto {
  @IsOptional()
  @IsString()
  @MaxLength(80)
  applicationId?: string;

  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name!: string;

  @IsEmail()
  @MaxLength(200)
  email!: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  cohort?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  track?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  destinationType?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  organisation?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  role?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  outcome6m?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  outcome12m?: string;

  @IsOptional()
  @IsBoolean()
  mentorWilling?: boolean;

  @IsOptional()
  @IsBoolean()
  testimonialConsent?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  notes?: string;
}

export class UpdateFellowshipAlumniDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(200)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  cohort?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  track?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  destinationType?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  organisation?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  role?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  outcome6m?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  outcome12m?: string;

  @IsOptional()
  @IsBoolean()
  mentorWilling?: boolean;

  @IsOptional()
  @IsBoolean()
  testimonialConsent?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  notes?: string;
}
