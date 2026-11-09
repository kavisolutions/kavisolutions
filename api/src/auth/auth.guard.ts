import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
  createParamDecorator,
} from "@nestjs/common";
import type { Request } from "express";

import { authDecision, resolveRouteAuthMode } from "@/_shared/route-auth";
import { AuthService } from "@/auth/auth.service";
import type { SessionUser } from "@/auth/auth.types";

export const IS_PUBLIC = "kavi:is-public";
export const IS_OPTIONAL_AUTH = "kavi:is-optional-auth";
export const IS_ADMIN_ONLY = "kavi:is-admin-only";

export type AuthedRequest = Request & {
  user?: SessionUser | null;
  isAdmin?: boolean;
};

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const mode = resolveRouteAuthMode({
      isPublic: this.hasMetadata(context, IS_PUBLIC),
      isOptional: this.hasMetadata(context, IS_OPTIONAL_AUTH),
      isAdminOnly: this.hasMetadata(context, IS_ADMIN_ONLY),
    });

    const request = context.switchToHttp().getRequest<AuthedRequest>();
    const user = await this.authService.getSession(request.headers);
    request.user = user;
    request.isAdmin = await this.authService.isAdmin(user);

    const decision = authDecision(mode, {
      hasUser: Boolean(user),
      isAdmin: request.isAdmin === true,
    });

    if (decision === "unauthorized") throw new UnauthorizedException("Sign in required");
    if (decision === "forbidden") throw new ForbiddenException("Admins only");

    return true;
  }

  private hasMetadata(context: ExecutionContext, key: string): boolean {
    return (
      Reflect.getMetadata(key, context.getHandler()) === true ||
      Reflect.getMetadata(key, context.getClass()) === true
    );
  }
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): SessionUser | null => {
    const request = context.switchToHttp().getRequest<AuthedRequest>();
    return request.user ?? null;
  },
);

export const CurrentIsAdmin = createParamDecorator(
  (_data: unknown, context: ExecutionContext): boolean => {
    const request = context.switchToHttp().getRequest<AuthedRequest>();
    return request.isAdmin === true;
  },
);
