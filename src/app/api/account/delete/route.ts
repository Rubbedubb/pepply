import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { apiError } from "@/lib/http";
import { getRequestUser, isRequestDemo } from "@/lib/request-user";

const deleteSchema = z.object({
  confirmation: z.literal("RADERA MITT KONTO"),
});

export async function DELETE(request: Request) {
  try {
    const user = await getRequestUser();
    deleteSchema.parse(await request.json());

    if (isRequestDemo()) {
      return NextResponse.json({
        ok: true,
        mode: "demo",
        message: "Demokontot innehåller inga serverlagrade personuppgifter.",
      });
    }

    const admin = createAdminClient();
    const { error } = await admin.auth.admin.deleteUser(user.id, false);
    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (error) {
    return apiError(error);
  }
}
