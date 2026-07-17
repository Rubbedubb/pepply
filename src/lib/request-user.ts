import "server-only";

import { cookies } from "next/headers";
import { isDemoMode } from "@/lib/env";
import { requireRole, requireUser, type AuthenticatedUser } from "@/lib/auth/dal";
import type { UserRole } from "@/lib/types";

const DEMO_USER: AuthenticatedUser = {
  id: "00000000-0000-4000-8000-000000000001",
  email: "demo@pepply.local",
  role: "admin",
};

const DEMO_USER_COOKIE = "pepply_demo_id";
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function getDemoUser(): Promise<AuthenticatedUser> {
  const cookieId = (await cookies()).get(DEMO_USER_COOKIE)?.value;
  return {
    ...DEMO_USER,
    id: cookieId && UUID_PATTERN.test(cookieId) ? cookieId : DEMO_USER.id,
  };
}

export function isRequestDemo(): boolean {
  return isDemoMode;
}

export async function getRequestUser(): Promise<AuthenticatedUser> {
  return isDemoMode ? getDemoUser() : requireUser();
}

export async function getRequestUserWithRole(
  roles: UserRole[],
): Promise<AuthenticatedUser> {
  if (isDemoMode) {
    const user = await getDemoUser();
    if (!roles.includes(user.role)) throw new Error("FORBIDDEN");
    return user;
  }
  return requireRole(roles);
}
