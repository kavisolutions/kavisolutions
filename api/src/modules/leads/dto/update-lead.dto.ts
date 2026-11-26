import { IsIn, IsOptional, IsString, MaxLength } from "class-validator";

import { LEAD_STATUSES } from "@/db/drizzle/schema";

export class UpdateLeadDto {
  @IsOptional()
  @IsIn(LEAD_STATUSES)
  status?: (typeof LEAD_STATUSES)[number];

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  notes?: string;
}
