import {
  ArrayMaxSize,
  IsArray,
  IsDateString,
  IsEmail,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from "class-validator";

import { FELLOWSHIP_INTERVIEW_STATUSES } from "@/db/drizzle/schema";

export const FELLOWSHIP_RECOMMENDATIONS = ["offer", "waitlist", "reject"] as const;
export type FellowshipRecommendation = (typeof FELLOWSHIP_RECOMMENDATIONS)[number];

export class CreateFellowshipInterviewDto {
  @IsString()
  @MaxLength(80)
  applicationId!: string;

  @IsDateString()
  scheduledAt!: string;

  @IsIn(["online", "offline"])
  mode!: "online" | "offline";

  @IsOptional()
  @IsString()
  @MaxLength(300)
  location?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  meetingUrl?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(8)
  @IsString({ each: true })
  mentorIds?: string[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(8)
  @IsEmail({}, { each: true })
  adminEmails?: string[];
}

export class FellowshipScorecardDto {
  @IsInt()
  @Min(1)
  @Max(5)
  motivationScore!: number;

  @IsInt()
  @Min(1)
  @Max(5)
  commitmentScore!: number;

  @IsInt()
  @Min(1)
  @Max(5)
  communicationScore!: number;

  @IsInt()
  @Min(1)
  @Max(5)
  problemScore!: number;

  @IsInt()
  @Min(1)
  @Max(5)
  fieldScore!: number;

  @IsInt()
  @Min(1)
  @Max(5)
  fitScore!: number;

  @IsIn(FELLOWSHIP_RECOMMENDATIONS)
  recommendation!: FellowshipRecommendation;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  notes?: string;
}

export class UpdateFellowshipInterviewDto {
  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @IsOptional()
  @IsIn(["online", "offline"])
  mode?: "online" | "offline";

  @IsOptional()
  @IsString()
  @MaxLength(300)
  location?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  meetingUrl?: string;

  @IsOptional()
  @IsIn(FELLOWSHIP_INTERVIEW_STATUSES)
  status?: (typeof FELLOWSHIP_INTERVIEW_STATUSES)[number];
}

export class UpdateFellowshipInterviewPanelDto {
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(8)
  @IsString({ each: true })
  mentorIds?: string[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(8)
  @IsEmail({}, { each: true })
  adminEmails?: string[];
}

export class FellowshipPanelTokenDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(90)
  expiresInDays?: number;
}

export class FellowshipRescheduleRequestDto {
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  note?: string;
}
