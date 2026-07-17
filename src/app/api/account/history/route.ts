import { NextResponse } from "next/server";
import { z } from "zod";
import { weeklyHistory } from "@/lib/demo-data";
import { apiError } from "@/lib/http";
import { getRequestUser, isRequestDemo } from "@/lib/request-user";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({ confirmation: z.literal("RENSA MIN HISTORIK") });

interface RitualHistoryRow {
  completed_at: string | null;
  check_ins: Related<{ mood_label: string }>;
}

interface SavedHistoryRow {
  id: string;
  created_at: string;
  generated_messages: Related<{ content: string }>;
  community_messages: Related<{ content: string }>;
  professional_messages: Related<{ content: string }>;
}

type Related<T> = T | T[] | null;

function relatedValue<T>(value: Related<T>): T | null {
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function dateKey(value: Date | string) {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Stockholm",
  }).format(new Date(value));
}

function dayLabel(value: Date) {
  const label = new Intl.DateTimeFormat("sv-SE", {
    weekday: "short",
    timeZone: "Europe/Stockholm",
  })
    .format(value)
    .replace(".", "");
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export async function GET() {
  try {
    const user = await getRequestUser();
    if (isRequestDemo()) {
      return NextResponse.json({
        stats: {
          ritualCount: 18,
          completedLastSevenDays: 5,
          helpfulPercent: 82,
          completedGoalSteps: 3,
          totalGoalSteps: 5,
        },
        week: weeklyHistory,
        latestMessage: null,
        saved: [],
      });
    }

    const supabase = await createClient();
    const weekStart = new Date(Date.now() - 7 * 86_400_000).toISOString();
    const [
      ritualResult,
      ritualCountResult,
      feedbackResult,
      helpfulResult,
      latestResult,
      savedResult,
      goalStepsResult,
      completedGoalStepsResult,
    ] = await Promise.all([
      supabase
        .from("rituals")
        .select("completed_at, check_ins(mood_label)")
        .eq("user_id", user.id)
        .eq("status", "completed")
        .gte("completed_at", weekStart)
        .order("completed_at", { ascending: false }),
      supabase
        .from("rituals")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("status", "completed"),
      supabase
        .from("message_feedback")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id),
      supabase
        .from("message_feedback")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("helpful", true),
      supabase
        .from("generated_messages")
        .select("content, created_at")
        .eq("user_id", user.id)
        .is("disabled_at", null)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("saved_messages")
        .select(
          "id, created_at, generated_messages(content), community_messages(content), professional_messages(content)",
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20),
      supabase
        .from("goal_steps")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id),
      supabase
        .from("goal_steps")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .not("completed_at", "is", null),
    ]);
    for (const result of [
      ritualResult,
      ritualCountResult,
      feedbackResult,
      helpfulResult,
      latestResult,
      savedResult,
      goalStepsResult,
      completedGoalStepsResult,
    ]) {
      if (result.error) throw result.error;
    }

    const rituals = (ritualResult.data ?? []) as RitualHistoryRow[];
    const ritualByDate = new Map(
      rituals
        .filter((ritual) => ritual.completed_at)
        .map((ritual) => [dateKey(ritual.completed_at as string), ritual]),
    );
    const week = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(Date.now() - (6 - index) * 86_400_000);
      const ritual = ritualByDate.get(dateKey(date));
      return {
        day: dayLabel(date),
        completed: Boolean(ritual),
        mood: relatedValue(ritual?.check_ins ?? null)?.mood_label ?? null,
      };
    });
    const totalFeedback = feedbackResult.count ?? 0;
    const saved = ((savedResult.data ?? []) as SavedHistoryRow[])
      .map((item) => ({
        id: item.id,
        text:
          relatedValue(item.generated_messages)?.content ??
          relatedValue(item.community_messages)?.content ??
          relatedValue(item.professional_messages)?.content ??
          "",
        createdAt: item.created_at,
      }))
      .filter((item) => item.text);

    return NextResponse.json({
      stats: {
        ritualCount: ritualCountResult.count ?? 0,
        completedLastSevenDays: week.filter((day) => day.completed).length,
        helpfulPercent: totalFeedback
          ? Math.round(((helpfulResult.count ?? 0) / totalFeedback) * 100)
          : null,
        completedGoalSteps: completedGoalStepsResult.count ?? 0,
        totalGoalSteps: goalStepsResult.count ?? 0,
      },
      week,
      latestMessage: latestResult.data
        ? {
            text: latestResult.data.content,
            createdAt: latestResult.data.created_at,
          }
        : null,
      saved,
    });
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getRequestUser();
    schema.parse(await request.json());

    if (!isRequestDemo()) {
      const supabase = await createClient();
      // Child tables use ON DELETE CASCADE from rituals and conversations.
      const operations = [
        supabase.from("ai_conversations").delete().eq("user_id", user.id),
        supabase.from("rituals").delete().eq("user_id", user.id),
        supabase.from("check_ins").delete().eq("user_id", user.id),
        supabase.from("saved_messages").delete().eq("user_id", user.id),
      ];
      const results = await Promise.all(operations);
      const failure = results.find((result) => result.error);
      if (failure?.error) throw failure.error;
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return apiError(error);
  }
}
