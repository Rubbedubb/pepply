import { NextResponse } from "next/server";
import { generateChatReply } from "@/lib/ai/service";
import { apiError } from "@/lib/http";
import { enforceRateLimit } from "@/lib/rate-limit";
import { getRequestUser, isRequestDemo } from "@/lib/request-user";
import { createClient } from "@/lib/supabase/server";
import { chatInputSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const user = await getRequestUser();
    const input = chatInputSchema.parse(await request.json());
    await enforceRateLimit({
      key: `${user.id}:chat`,
      action: "chat_message",
      limit: 20,
      windowSeconds: 86_400,
    });

    let recentMessages: Array<{
      role: "user" | "assistant";
      content: string;
    }> = [];

    if (!isRequestDemo() && input.conversationId) {
      const supabase = await createClient();
      const { data } = await supabase
        .from("ai_conversation_messages")
        .select("role, content")
        .eq("conversation_id", input.conversationId)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(6);
      recentMessages = (data ?? [])
        .reverse()
        .filter(
          (item) => item.role === "user" || item.role === "assistant",
        ) as typeof recentMessages;
    }

    const result = await generateChatReply({
      message: input.message,
      turnCount: input.turnCount,
      recentMessages,
    });

    let conversationId = input.conversationId ?? crypto.randomUUID();
    if (!isRequestDemo()) {
      const supabase = await createClient();
      if (!input.conversationId) {
        const { data, error } = await supabase
          .from("ai_conversations")
          .insert({ user_id: user.id, title: "Reflektion" })
          .select("id")
          .single();
        if (error) throw error;
        conversationId = data.id;
      }

      const { error } = await supabase.from("ai_conversation_messages").insert([
        {
          user_id: user.id,
          conversation_id: conversationId,
          role: "user",
          content: input.message,
          safety_level: result.safetyLevel,
        },
        {
          user_id: user.id,
          conversation_id: conversationId,
          role: "assistant",
          content: result.text,
          safety_level: result.safetyLevel,
        },
      ]);
      if (error) throw error;
    }

    return NextResponse.json({
      conversationId,
      message: result.text,
      safetyLevel: result.safetyLevel,
      suggestEnding: input.turnCount >= 5,
    });
  } catch (error) {
    return apiError(error);
  }
}
