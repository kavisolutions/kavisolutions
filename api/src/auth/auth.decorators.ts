import { SetMetadata } from "@nestjs/common";

import { IS_ADMIN_ONLY, IS_OPTIONAL_AUTH, IS_PUBLIC } from "@/auth/auth.guard";

export const Public = () => SetMetadata(IS_PUBLIC, true);
export const OptionalAuth = () => SetMetadata(IS_OPTIONAL_AUTH, true);
export const AdminOnly = () => SetMetadata(IS_ADMIN_ONLY, true);
