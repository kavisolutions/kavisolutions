import {
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from "class-validator";

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

export class ImportDriveMediaDto {
  /* Accepts a full Drive folder URL or the bare folder ID. */
  @IsString()
  @MinLength(10)
  @MaxLength(2000)
  folderUrl!: string;

  /* First day for images whose filenames carry no date. */
  @IsOptional()
  @Matches(DATE_ONLY, { message: "startDate must be YYYY-MM-DD" })
  startDate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  topicHint?: string;
}

export class UploadMediaDto {
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  fileName!: string;

  @Matches(DATE_ONLY, { message: "date must be YYYY-MM-DD" })
  date!: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  topicHint?: string;

  /* Raw base64 (no data: prefix needed). Checked against 20MB in the service. */
  @IsString()
  @MinLength(100)
  dataBase64!: string;
}

export class UpdateMediaDto {
  @IsOptional()
  @Matches(DATE_ONLY, { message: "scheduledDate must be YYYY-MM-DD" })
  scheduledDate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  topicHint?: string;

  /* Only these two are safe to set from the panel; drafted/published/failed
     are written by the worker itself. */
  @IsOptional()
  @IsIn(["planned", "skipped"])
  status?: "planned" | "skipped";
}

export class DraftMediaDto {
  @IsOptional()
  @IsBoolean()
  force?: boolean;
}
