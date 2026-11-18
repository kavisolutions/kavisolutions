import { IsString, MaxLength, MinLength } from "class-validator";

export class UpsertFellowshipEmailTemplateDto {
  @IsString()
  @MinLength(1)
  @MaxLength(300)
  subject!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(8000)
  body!: string;
}
