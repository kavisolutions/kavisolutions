import {
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";

import {
  FELLOWSHIP_CASE_SEVERITIES,
  FELLOWSHIP_CASE_STATUSES,
} from "@/db/drizzle/schema";

export const FELLOWSHIP_CASE_CATEGORIES = [
  "posh",
  "safeguarding",
  "grievance",
  "wellbeing",
  "other",
] as const;

export class CreateFellowshipCaseDto {
  @IsOptional()
  @IsString()
  @MaxLength(80)
  applicationId?: string;

  @IsIn(FELLOWSHIP_CASE_CATEGORIES)
  category!: (typeof FELLOWSHIP_CASE_CATEGORIES)[number];

  @IsIn(FELLOWSHIP_CASE_SEVERITIES)
  severity!: (typeof FELLOWSHIP_CASE_SEVERITIES)[number];

  @IsString()
  @MinLength(4)
  @MaxLength(500)
  summary!: string;

  @IsOptional()
  @IsString()
  @MaxLength(8000)
  details?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  assignedTo?: string;
}

export class UpdateFellowshipCaseDto {
  @IsOptional()
  @IsIn(FELLOWSHIP_CASE_CATEGORIES)
  category?: (typeof FELLOWSHIP_CASE_CATEGORIES)[number];

  @IsOptional()
  @IsIn(FELLOWSHIP_CASE_SEVERITIES)
  severity?: (typeof FELLOWSHIP_CASE_SEVERITIES)[number];

  @IsOptional()
  @IsString()
  @MaxLength(500)
  summary?: string;

  @IsOptional()
  @IsString()
  @MaxLength(8000)
  details?: string;

  @IsOptional()
  @IsIn(FELLOWSHIP_CASE_STATUSES)
  status?: (typeof FELLOWSHIP_CASE_STATUSES)[number];

  @IsOptional()
  @IsString()
  @MaxLength(200)
  assignedTo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(8000)
  resolution?: string;
}
