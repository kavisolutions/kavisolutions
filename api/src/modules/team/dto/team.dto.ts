import { IsOptional, IsString, MaxLength } from "class-validator";

export class CreateMemberDto {
  @IsString()
  @MaxLength(120)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  role?: string;

  @IsOptional()
  @IsString()
  teamId?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  bio?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  profileUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  linkedinUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  gradient?: string;

  @IsOptional()
  sortOrder?: number;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  imageUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(254)
  email?: string;

  @IsOptional()
  @IsString()
  password?: string;
}

export class UpdateMemberDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  role?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  bio?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  imageUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  gradient?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  profileUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  linkedinUrl?: string;

  @IsOptional()
  sortOrder?: number;

  @IsOptional()
  @IsString()
  teamId?: string | null;
}

export class CreateLoginDto {
  @IsString()
  @MaxLength(254)
  email!: string;

  @IsString()
  password!: string;
}
