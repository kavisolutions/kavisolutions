import { IsOptional, IsString, MaxLength } from "class-validator";

export class UpdateFellowshipPolicyDto {
  @IsOptional()
  @IsString()
  @MaxLength(400)
  fee?: string;

  @IsOptional()
  @IsString()
  @MaxLength(400)
  scholarship?: string;

  @IsOptional()
  @IsString()
  @MaxLength(400)
  stipend?: string;

  @IsOptional()
  @IsString()
  @MaxLength(400)
  accommodation?: string;

  @IsOptional()
  @IsString()
  @MaxLength(400)
  insurance?: string;

  @IsOptional()
  @IsString()
  @MaxLength(400)
  eligibility?: string;

  @IsOptional()
  @IsString()
  @MaxLength(400)
  leave?: string;

  @IsOptional()
  @IsString()
  @MaxLength(400)
  cohortNote?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  nextIntake?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  seats?: string;
}
