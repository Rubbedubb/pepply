import { NextResponse } from "next/server";
import { professionalMessages } from "@/lib/demo-data";
import { apiError } from "@/lib/http";
import { getRequestUser, isRequestDemo } from "@/lib/request-user";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    await getRequestUser();
    if (isRequestDemo()) {
      return NextResponse.json({
        messages: professionalMessages.map((message) => ({
          ...message,
          source: "professional" as const,
        })),
      });
    }

    const supabase = await createClient();
    const [professionalResult, communityResult] = await Promise.all([
      supabase
        .from("professional_messages")
        .select("id, title, content, category, reviewer")
        .eq("published", true)
        .is("disabled_at", null)
        .order("created_at", { ascending: false })
        .limit(50),
      supabase
        .from("community_messages")
        .select("id, content, category, attribution")
        .eq("published", true)
        .is("disabled_at", null)
        .order("created_at", { ascending: false })
        .limit(50),
    ]);
    if (professionalResult.error) throw professionalResult.error;
    if (communityResult.error) throw communityResult.error;

    return NextResponse.json({
      messages: [
        ...(professionalResult.data ?? []).map((message) => ({
          id: message.id,
          category: message.category,
          title: message.title,
          text: message.content,
          author: message.reviewer || "Pepplys redaktion",
          source: "professional" as const,
        })),
        ...(communityResult.data ?? []).map((message) => ({
          id: message.id,
          category: message.category,
          title: "Från Pepplys community",
          text: message.content,
          author:
            message.attribution === "anonymous"
              ? "Anonymt bidrag"
              : "Communitymedlem",
          source: "community" as const,
        })),
      ],
    });
  } catch (error) {
    return apiError(error);
  }
}
