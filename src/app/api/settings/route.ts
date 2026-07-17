import { NextResponse } from "next/server";
import { z } from "zod";
import { apiError } from "@/lib/http";
import { getRequestUser, isRequestDemo } from "@/lib/request-user";
import { createClient } from "@/lib/supabase/server";
import { supportAreas, toneOptions } from "@/lib/types";

const schema = z.object({
  tone: z.enum(toneOptions),
  messageLength: z.enum(["kort", "utvecklad"]),
  reminderTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  remindersEnabled: z.boolean(),
  streaksEnabled: z.boolean(),
  personalHistoryEnabled: z.boolean(),
  areas: z.array(z.enum(supportAreas)).min(1).max(7),
  theme: z.enum(["light", "dark", "system"]),
});

export async function PATCH(request: Request) {
  try {
    const user = await getRequestUser();
    const input = schema.parse(await request.json());
    if (!isRequestDemo()) {
      const supabase = await createClient();
      const { error } = await supabase.from("user_preferences").upsert({
        user_id: user.id,
        tone: input.tone,
        message_length: input.messageLength,
        reminder_time: input.reminderTime,
        reminders_enabled: input.remindersEnabled,
        streaks_enabled: input.streaksEnabled,
        personal_history_enabled: input.personalHistoryEnabled,
        support_areas: input.areas,
        theme: input.theme,
      });
      if (error) throw error;
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    return apiError(error);
  }
}
