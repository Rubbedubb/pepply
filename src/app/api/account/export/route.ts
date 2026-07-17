import { NextResponse } from "next/server";
import { apiError } from "@/lib/http";
import { getRequestUser, isRequestDemo } from "@/lib/request-user";
import { createClient } from "@/lib/supabase/server";

const exportTables = [
  "user_profiles",
  "user_preferences",
  "consent_records",
  "check_ins",
  "rituals",
  "generated_messages",
  "message_feedback",
  "saved_messages",
  "goals",
  "goal_steps",
  "goal_progress",
  "ai_conversations",
  "ai_conversation_messages",
] as const;

export async function GET() {
  try {
    const user = await getRequestUser();
    if (isRequestDemo()) {
      return NextResponse.json({
        exportedAt: new Date().toISOString(),
        mode: "demo",
        note: "Demoläget sparar inga privata uppgifter på servern.",
      });
    }

    const supabase = await createClient();
    const entries = await Promise.all(
      exportTables.map(async (table) => {
        const { data, error } = await supabase
          .from(table)
          .select("*")
          .eq("user_id", user.id);
        if (error) throw error;
        return [table, data] as const;
      }),
    );

    return new NextResponse(
      JSON.stringify(
        {
          exportedAt: new Date().toISOString(),
          formatVersion: "1.0",
          data: Object.fromEntries(entries),
        },
        null,
        2,
      ),
      {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Content-Disposition": `attachment; filename="pepply-export-${new Date().toISOString().slice(0, 10)}.json"`,
        },
      },
    );
  } catch (error) {
    return apiError(error);
  }
}
