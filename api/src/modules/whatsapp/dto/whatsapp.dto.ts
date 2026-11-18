import {
  IsBoolean,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from "class-validator";

export class SendWhatsAppDto {
  @IsString()
  @MinLength(8)
  @MaxLength(30)
  to!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(4000)
  message!: string;
}

export class UpdateWhatsAppSettingsDto {
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @IsOptional()
  @IsString()
  @Matches(/^\d{1,4}$/, { message: "Country code must be 1-4 digits" })
  countryCode?: string;
}
