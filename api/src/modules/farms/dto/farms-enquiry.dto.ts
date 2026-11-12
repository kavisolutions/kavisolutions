import { IsEmail, IsIn, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

/* Product and tourism enquiries share one endpoint. `kind` decides which
   optional fields are meaningful; the controller rejects fields from the
   other track so a mixed payload cannot silently drop information. */
export class CreateFarmsEnquiryDto {
  @IsIn(["product", "tourism"])
  kind!: "product" | "tourism";

  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name!: string;

  @IsEmail()
  @MaxLength(200)
  email!: string;

  @IsString()
  @MinLength(6)
  @MaxLength(30)
  phone!: string;

  /** Product track. */
  @IsOptional()
  @IsString()
  @MaxLength(120)
  product?: string;

  /** Product track: free text so "10 kg" or "2 boxes" both work. */
  @IsOptional()
  @IsString()
  @MaxLength(80)
  quantity?: string;

  /** Tourism track: package or visit type. */
  @IsOptional()
  @IsString()
  @MaxLength(120)
  service?: string;

  /** Tourism track: preferred month. */
  @IsOptional()
  @IsString()
  @MaxLength(40)
  travelMonth?: string;

  /** Tourism track: group size, kept as text so "2 adults + 1 child" works. */
  @IsOptional()
  @IsString()
  @MaxLength(40)
  groupSize?: string;

  @IsString()
  @MinLength(10)
  @MaxLength(2000)
  message!: string;
}
