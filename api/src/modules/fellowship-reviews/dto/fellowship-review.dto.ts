import {
  IsEmail,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from "class-validator";

export const FELLOWSHIP_RECOMMENDATIONS = ["offer", "waitlist", "reject"] as const;
export type FellowshipRecommendation = (typeof FELLOWSHIP_RECOMMENDATIONS)[number];

export class AssignFellowshipReviewDto {
  @IsString()
  @MaxLength(80)
  applicationId!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(120)
  reviewerName!: string;

  @IsEmail()
  @MaxLength(200)
  reviewerEmail!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(60)
  expiresInDays?: number;
}

export class FellowshipReviewScorecardDto {
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
