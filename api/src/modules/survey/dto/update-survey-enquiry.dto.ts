import { IsIn, IsOptional, IsString, MaxLength } from "class-validator";

import { SURVEY_ENQUIRY_STATUSES } from "@/db/drizzle/schema";

export class UpdateSurveyEnquiryDto {
  @IsOptional()
  @IsIn(SURVEY_ENQUIRY_STATUSES)
  status?: (typeof SURVEY_ENQUIRY_STATUSES)[number];

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}
