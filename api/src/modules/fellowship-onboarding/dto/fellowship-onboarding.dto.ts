import {
  IsBoolean,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";

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
  @MaxLength(4000)
  notes?: string;
}
