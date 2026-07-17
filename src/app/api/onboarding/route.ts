import { NextResponse } from "next/server";
import { apiError } from "@/lib/http";
import { getRequestUser, isRequestDemo } from "@/lib/request-user";
import { createClient } from "@/lib/supabase/server";
import { onboardingSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const user = await getRequestUser();
    const input = onboardingSchema.parse(await request.json());

    if (!isRequestDemo()) {
      const supabase = await createClient();
      const { error: profileError } = await supabase.from("user_profiles").upsert({
        user_id: user.id,
        display_name: input.displayName,
        onboarding_completed_at: new Date().toISOString(),
      });
      if (profileError) throw profileError;

      const { error: preferenceError } = await supabase
        .from("user_preferences")
        .upsert({
          user_id: user.id,
          support_areas: input.areas,
          tone: input.tone,
          reminder_time: input.reminderTime,
          reminders_enabled: input.remindersEnabled,
          message_length: input.messageLength,
        });
      if (preferenceError) throw preferenceError;

      const { error: consentError } = await supabase
        .from("consent_records")
        .insert({
          user_id: user.id,
          consent_type: "privacy_and_ai_personalization",
          document_version: input.consentVersion,
          granted: true,
        });
      if (consentError) throw consentError;

      if (input.currentGoal) {
        const { error: goalError } = await supabase.from("goals").insert({
          user_id: user.id,
          title: input.currentGoal,
          category: input.areas[0],
          status: "active",
        });
        if (goalError) throw goalError;
      }
    }

    return NextResponse.json({ ok: true, redirectTo: "/hem" });
  } catch (error) {
    return apiError(error);
  }
}
