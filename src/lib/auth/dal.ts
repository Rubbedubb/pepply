import "server-only";

import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/types";

export interface AuthenticatedUser {
  id: string;
  email?: string;
  role: UserRole;
}

export const getOptionalUser = cache(async (): Promise<AuthenticatedUser | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: roleRow } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  return {
    id: user.id,
    email: user.email,
    role: (roleRow?.role as UserRole | undefined) ?? "user",
  };
});

export async function requireUser(): Promise<AuthenticatedUser> {
  const user = await getOptionalUser();
  if (!user) throw new Error("UNAUTHENTICATED");
  return user;
}

export async function requireRole(
  allowedRoles: UserRole[],
): Promise<AuthenticatedUser> {
  const user = await requireUser();
  if (!allowedRoles.includes(user.role)) throw new Error("FORBIDDEN");
  return user;
}
