import { NextResponse } from "next/server";
import { apiError } from "@/lib/http";
import { getRequestUser, isRequestDemo } from "@/lib/request-user";
import { createClient } from "@/lib/supabase/server";
import { feedbackSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const user = await getRequestUser();
    const input = feedbackSchema.parse(await request.json());

    if (!isRequestDemo()) {
      const supabase = await createClient();
      const { error } = await supabase.from("message_feedback").upsert(
        {
          user_id: user.id,
          message_id: input.messageId,
          helpful: input.helpful,
          tone_adjustment: input.toneAdjustment ?? null,
        },
        { onConflict: "user_id,message_id" },
      );
      if (error) throw error;
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return apiError(error);
  }
}
