import {
  IsBoolean,
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from "class-validator";

import { FELLOWSHIP_APPLICATION_STAGES } from "@/db/drizzle/schema";

export class CreateFellowshipApplicationDto {
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
  city?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  candidateStatus?: string;

  @IsString()
  @MinLength(2)
  @MaxLength(120)
  track!: string;

  @IsString()
  @MinLength(20)
  @MaxLength(4000)
  motivation!: string;

  @IsBoolean()
  fullTime!: boolean;

  @IsBoolean()
  vipassana!: boolean;

  @IsBoolean()
  fieldWork!: boolean;

  @IsBoolean()
  termsAccepted!: boolean;
}

export class FellowshipApplicationStatusDto {
  @IsString()
  @Matches(/^KF-\d{4}-[A-F0-9]{8}$/i, { message: "Invalid application reference" })
  reference!: string;

  @IsEmail()
  @MaxLength(200)
  email!: string;
}

export class UpdateFellowshipApplicationDto {
  @IsOptional()
  @IsIn(FELLOWSHIP_APPLICATION_STAGES)
  stage?: (typeof FELLOWSHIP_APPLICATION_STAGES)[number];

  @IsOptional()
  @IsString()
  @MaxLength(80)
  cohort?: string;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  notes?: string;
}
