import {
  IsBoolean,
  IsDateString,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";

import { FELLOWSHIP_DOCUMENT_STATUSES } from "@/db/drizzle/schema";

export class UpsertFellowshipOnboardingDto {
  @IsOptional()
  @IsBoolean()
  idVerified?: boolean;

  @IsOptional()
  @IsBoolean()
  educationVerified?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  emergencyContact?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  medicalNotes?: string;

  @IsOptional()
  @IsBoolean()
  codeOfConduct?: boolean;

  @IsOptional()
  @IsBoolean()
  poshAck?: boolean;

  @IsOptional()
  @IsBoolean()
  mediaConsent?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  deviceNeeds?: string;

  @IsOptional()
  @IsBoolean()
  baselineDone?: boolean;

  @IsOptional()
  @IsBoolean()
  vipassanaAck?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  accommodationNotes?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  travelNotes?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  foodNotes?: string;

  @IsOptional()
  @IsDateString()
  arrivalAt?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  notes?: string;
}

export class UpdateFellowshipDocumentDto {
  @IsOptional()
  @IsIn(FELLOWSHIP_DOCUMENT_STATUSES)
  status?: (typeof FELLOWSHIP_DOCUMENT_STATUSES)[number];

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}
