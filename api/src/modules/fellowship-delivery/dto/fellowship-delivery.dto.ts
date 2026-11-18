import {
  IsBoolean,
  IsEmail,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from "class-validator";

import { FELLOWSHIP_DELIVERY_TYPES } from "@/db/drizzle/schema";

export class CreateFellowshipDeliveryReviewDto {
  @IsString()
  @MaxLength(80)
  applicationId!: string;

  @IsIn(FELLOWSHIP_DELIVERY_TYPES)
  type!: (typeof FELLOWSHIP_DELIVERY_TYPES)[number];

  @IsOptional()
  @IsString()
  @MaxLength(80)
  phase?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(60)
  week?: number;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  reviewerName?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(200)
  reviewerEmail?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  attendancePercent?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  deliverableScore?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  collaborationScore?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  fieldScore?: number;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  notes?: string;

  @IsOptional()
  @IsBoolean()
  atRisk?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  riskNotes?: string;
}

export class UpdateFellowshipDeliveryReviewDto {
  @IsOptional()
  @IsIn(FELLOWSHIP_DELIVERY_TYPES)
  type?: (typeof FELLOWSHIP_DELIVERY_TYPES)[number];

  @IsOptional()
  @IsString()
  @MaxLength(80)
  phase?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(60)
  week?: number;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  reviewerName?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(200)
  reviewerEmail?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  attendancePercent?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  deliverableScore?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  collaborationScore?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  fieldScore?: number;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  notes?: string;

  @IsOptional()
  @IsBoolean()
  atRisk?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  riskNotes?: string;
}
