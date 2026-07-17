import { NextResponse } from "next/server";
import { z } from "zod";
import { apiError } from "@/lib/http";
import { getRequestUser, isRequestDemo } from "@/lib/request-user";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({
  messageId: z.uuid(),
  source: z
    .enum(["generated", "community", "professional"])
    .default("generated"),
});

const sourceColumns = {
  generated: "generated_message_id",
  community: "community_message_id",
  professional: "professional_message_id",
} as const;

interface SavedRow {
  id: string;
  created_at: string;
  generated_message_id: string | null;
  community_message_id: string | null;
  professional_message_id: string | null;
  generated_messages: Related<{ content: string }>;
  community_messages: Related<{ content: string }>;
  professional_messages: Related<{ content: string }>;
}

type Related<T> = T | T[] | null;

function relatedValue<T>(value: Related<T>): T | null {
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

export async function GET() {
  try {
    const user = await getRequestUser();
    if (isRequestDemo()) return NextResponse.json({ saved: [] });

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("saved_messages")
      .select(
        "id, created_at, generated_message_id, community_message_id, professional_message_id, generated_messages(content), community_messages(content), professional_messages(content)",
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw error;

    const saved = ((data ?? []) as SavedRow[]).map((item) => {
      if (item.generated_message_id) {
        return {
          id: item.id,
          messageId: item.generated_message_id,
          source: "generated" as const,
          text: relatedValue(item.generated_messages)?.content ?? "",
          createdAt: item.created_at,
        };
      }
      if (item.community_message_id) {
        return {
          id: item.id,
          messageId: item.community_message_id,
          source: "community" as const,
          text: relatedValue(item.community_messages)?.content ?? "",
          createdAt: item.created_at,
        };
      }
      return {
        id: item.id,
        messageId: item.professional_message_id,
        source: "professional" as const,
        text: relatedValue(item.professional_messages)?.content ?? "",
        createdAt: item.created_at,
      };
    });

    return NextResponse.json({ saved });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await getRequestUser();
    const input = schema.parse(await request.json());
    if (!isRequestDemo()) {
      const supabase = await createClient();
      const { error } = await supabase.from("saved_messages").insert({
        user_id: user.id,
        [sourceColumns[input.source]]: input.messageId,
      });
      if (error && error.code !== "23505") throw error;
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getRequestUser();
    const input = schema.parse(await request.json());
    if (!isRequestDemo()) {
      const supabase = await createClient();
      const { error } = await supabase
        .from("saved_messages")
        .delete()
        .eq("user_id", user.id)
        .eq(sourceColumns[input.source], input.messageId);
      if (error) throw error;
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    return apiError(error);
  }
}
