import { IsString, MaxLength, MinLength } from "class-validator";

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
