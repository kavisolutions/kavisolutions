import { IsBoolean, IsOptional } from "class-validator";

/* Partial update: an administrator can flip one page without having to send
   the state of the other, so a stale admin tab cannot republish something that
   was deliberately hidden elsewhere. */
export class UpdatePagesDto {
  @IsOptional()
  @IsBoolean()
  survey?: boolean;

  @IsOptional()
  @IsBoolean()
  financial?: boolean;
}
