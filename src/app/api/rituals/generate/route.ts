import { NextResponse } from "next/server";
import { generateRitualMessage } from "@/lib/ai/service";
import { isCloudflareAiConfigured, serverEnv } from "@/lib/env";
import { apiError } from "@/lib/http";
import { logServerError } from "@/lib/logger";
import { tryConsumeRateLimit } from "@/lib/rate-limit";
import { getRequestUser, isRequestDemo } from "@/lib/request-user";
import { createClient } from "@/lib/supabase/server";
import { classifySafety } from "@/lib/safety/classify";
import { supportAreas, toneOptions, type RitualInput } from "@/lib/types";
import { ritualInputSchema } from "@/lib/validation";

type Related<T> = T | T[] | null;

function relatedValue<T>(value: Related<T>): T | null {
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

export async function POST(request: Request) {
  try {
    const user = await getRequestUser();
    const input = ritualInputSchema.parse(await request.json());
    const safety = classifySafety(`${input.mood}\n${input.note ?? ""}`);
    let allowAi = safety.level === "none";
    if (allowAi && isCloudflareAiConfigured) {
      allowAi = await tryConsumeRateLimit({
        key: `${user.id}:ai`,
        action: "ai_generation",
        limit: serverEnv.AI_DAILY_USER_LIMIT,
        windowSeconds: 86_400,
      });
    }

    const demoMode = isRequestDemo();
    const supabase = demoMode ? null : await createClient();
    let effectiveInput: RitualInput = {
      ...input,
      recentMessages: demoMode ? (input.recentMessages ?? []) : [],
      recentFeedback: [],
    };

    if (supabase) {
      const [preferenceResult, goalResult] = await Promise.all([
        supabase
          .from("user_preferences")
          .select(
            "support_areas, tone, message_length, personal_history_enabled",
          )
          .eq("user_id", user.id)
          .maybeSingle(),
        supabase
          .from("goals")
          .select("title")
          .eq("user_id", user.id)
          .eq("status", "active")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);

      const queryError = [preferenceResult, goalResult].find(
        (query) => query.error,
      )?.error;
      if (queryError) {
        logServerError("ritual.personalization_read_failed", queryError);
      } else {
        const preferences = preferenceResult.data;
        const historyEnabled =
          preferences?.personal_history_enabled ?? true;
        const validAreas = (preferences?.support_areas ?? []).filter(
          (area: unknown): area is (typeof supportAreas)[number] =>
            supportAreas.includes(area as (typeof supportAreas)[number]),
        );
        const tone = toneOptions.includes(
          preferences?.tone as (typeof toneOptions)[number],
        )
          ? (preferences?.tone as (typeof toneOptions)[number])
          : input.tone;

        effectiveInput = {
          ...input,
          areas: validAreas.length ? validAreas : input.areas,
          tone,
          length:
            preferences?.message_length === "utvecklad"
              ? "utvecklad"
              : preferences?.message_length === "kort"
                ? "kort"
                : input.length,
          activeGoal: goalResult.data?.title,
          recentMessages: [],
          recentFeedback: [],
        };

        if (historyEnabled) {
          const [recentResult, feedbackResult] = await Promise.all([
            supabase
              .from("generated_messages")
              .select("content")
              .eq("user_id", user.id)
              .eq("safety_level", "none")
              .is("disabled_at", null)
              .order("created_at", { ascending: false })
              .limit(5),
            supabase
              .from("message_feedback")
              .select("helpful, generated_messages(content)")
              .eq("user_id", user.id)
              .order("updated_at", { ascending: false })
              .limit(5),
          ]);
          const historyError = [recentResult, feedbackResult].find(
            (query) => query.error,
          )?.error;
          if (historyError) {
            logServerError("ritual.history_read_failed", historyError);
          } else {
            effectiveInput.recentMessages = (recentResult.data ?? []).map(
              (message) => String(message.content).slice(0, 600),
            );
            effectiveInput.recentFeedback = (feedbackResult.data ?? []).flatMap(
              (item) => {
                const message = relatedValue(
                  item.generated_messages as Related<{ content: string }>,
                );
                return message
                  ? [
                      {
                        message: message.content.slice(0, 600),
                        helpful: item.helpful,
                      },
                    ]
                  : [];
              },
            );
          }
        }
      }
    }

    const result = await generateRitualMessage(effectiveInput, { allowAi });
    let messageId = crypto.randomUUID();

    if (supabase) {
      const { data: checkIn, error: checkInError } = await supabase
        .from("check_ins")
        .insert({
          user_id: user.id,
          mood_label: input.mood,
          note: input.note || null,
          question: input.question,
          safety_level: result.safetyLevel,
        })
        .select("id")
        .single();
      if (checkInError) throw checkInError;

      const { data: ritual, error: ritualError } = await supabase
        .from("rituals")
        .insert({
          user_id: user.id,
          check_in_id: checkIn.id,
          status: "completed",
          completed_at: new Date().toISOString(),
        })
        .select("id")
        .single();
      if (ritualError) throw ritualError;

      const { data: message, error: messageError } = await supabase
        .from("generated_messages")
        .insert({
          user_id: user.id,
          ritual_id: ritual.id,
          content: result.message,
          source: result.source,
          provider: result.provider ?? null,
          model: result.usage?.model ?? null,
          prompt_version: result.promptVersion,
          input_tokens: result.usage?.inputTokens ?? null,
          output_tokens: result.usage?.outputTokens ?? null,
          safety_level: result.safetyLevel,
        })
        .select("id")
        .single();
      if (messageError) throw messageError;
      messageId = message.id;

      if (result.safetyLevel !== "none") {
        const { error: safetyError } = await supabase.from("safety_events").insert({
          user_id: user.id,
          check_in_id: checkIn.id,
          level: result.safetyLevel,
          reason_codes: result.safetyReasons ?? [],
          resource_set: "sv-2026-07-17",
        });
        if (safetyError) {
          logServerError("ritual.safety_event_write_failed", safetyError, {
            safetyLevel: result.safetyLevel,
          });
        }
      }
    }

    return NextResponse.json({
      id: messageId,
      message: result.message,
      closing: result.closing,
      source: result.source,
      safetyLevel: result.safetyLevel,
    });
  } catch (error) {
    return apiError(error);
  }
}
