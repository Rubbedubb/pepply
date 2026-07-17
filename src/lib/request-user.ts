import "server-only";

import { isDemoMode } from "@/lib/env";
import { requireRole, requireUser, type AuthenticatedUser } from "@/lib/auth/dal";
import type { UserRole } from "@/lib/types";

const DEMO_USER: AuthenticatedUser = {
  id: "00000000-0000-4000-8000-000000000001",
  email: "demo@pepply.local",
  role: "admin",
};

export function isRequestDemo(): boolean {
  return isDemoMode;
}

export async function getRequestUser(): Promise<AuthenticatedUser> {
  return isDemoMode ? DEMO_USER : requireUser();
}

export async function getRequestUserWithRole(
  roles: UserRole[],
): Promise<AuthenticatedUser> {
  if (isDemoMode) {
    if (!roles.includes(DEMO_USER.role)) throw new Error("FORBIDDEN");
    return DEMO_USER;
  }
  return requireRole(roles);
}
