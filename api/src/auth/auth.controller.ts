import { All, Controller, Req, Res } from "@nestjs/common";
import type { Request, Response } from "express";
import { toNodeHandler } from "better-auth/node";

import { auth } from "@/auth/auth.config";
import { Public } from "@/auth/auth.decorators";

const handler = toNodeHandler(auth);

@Controller("auth")
export class AuthController {
  @All("*path")
  @Public()
  async handle(@Req() req: Request, @Res() res: Response): Promise<void> {
    await handler(req, res);
  }
}
