import { IsArray, IsIn, IsOptional, IsString, MaxLength } from "class-validator";

import { ALLOWED_LIVE_LINK_TYPES } from "@/_shared/text";

export class CreateProjectDto {
  @IsString()
  @MaxLength(120)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  appLink?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  webLink?: string;

  @IsOptional()
  @IsIn(ALLOWED_LIVE_LINK_TYPES as unknown as string[])
  liveLinkType?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  projectTypes?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];

  @IsOptional()
  sortOrder?: number;
}

export class UpdateProjectDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  appLink?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  webLink?: string;

  @IsOptional()
  @IsIn(ALLOWED_LIVE_LINK_TYPES as unknown as string[])
  liveLinkType?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  projectTypes?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];

  @IsOptional()
  sortOrder?: number;
}
