import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

/* Public contact form. The global ValidationPipe (whitelist + transform)
   only enforces class decorators, so this must stay a class — a TypeScript
   `type` is erased at runtime and leaves the endpoint unvalidated. */
export class SendContactDto {
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name!: string;

  @IsEmail()
  @MaxLength(200)
  email!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(30)
  phone!: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  service?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  message!: string;
}
