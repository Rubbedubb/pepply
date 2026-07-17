import "server-only";

import { cache } from "react";
import { demoGoals, demoPreferences } from "@/lib/demo-data";
import { getRequestUser, isRequestDemo } from "@/lib/request-user";
import { createClient } from "@/lib/supabase/server";
import {
  supportAreas,
  toneOptions,
  type MessageLength,
  type SupportArea,
  type ToneOption,
  type UserRole,
} from "@/lib/types";

export interface AppUserSummary {
  displayName: string;
  email: string;
  plan: "Gratis" | "Premium";
  role: UserRole;
}

export interface HomeData {
  displayName: string;
  activeGoal?: {
    title: string;
    completedSteps: number;
    totalSteps: number;
  };
  streakCount: number;
  week: boolean[];
  reminderTime: string;
  streaksEnabled: boolean;
}

export interface SettingsData {
  displayName: string;
  activeGoal?: string;
  tone: ToneOption;
  messageLength: MessageLength;
  reminderTime: string;
  remindersEnabled: boolean;
  streaksEnabled: boolean;
  personalHistoryEnabled: boolean;
  areas: SupportArea[];
  theme: "light" | "dark" | "system";
}

function swedishDateKey(value: Date | string) {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Stockholm",
  }).format(new Date(value));
}

function normalizeAreas(value: unknown): SupportArea[] {
  if (!Array.isArray(value)) return ["vardagsmotivation"];
  const valid = value.filter((item): item is SupportArea =>
    supportAreas.includes(item as SupportArea),
  );
  return valid.length ? valid : ["vardagsmotivation"];
}

function normalizeTone(value: unknown): ToneOption {
  return toneOptions.includes(value as ToneOption)
    ? (value as ToneOption)
    : "lugn och mjuk";
}

export const getAppUserSummary = cache(async (): Promise<AppUserSummary> => {
  const user = await getRequestUser();
  if (isRequestDemo()) {
    return {
      displayName: demoPreferences.displayName,
      email: user.email ?? "demo@pepply.local",
      plan: "Gratis",
      role: user.role,
    };
  }

  const supabase = await createClient();
  const [{ data: profile, error: profileError }, { data: subscription, error: subscriptionError }] =
    await Promise.all([
      supabase
        .from("user_profiles")
        .select("display_name")
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase
        .from("subscriptions")
        .select("id")
        .eq("user_id", user.id)
        .in("status", ["trialing", "active"])
        .limit(1)
        .maybeSingle(),
    ]);
  if (profileError) throw profileError;
  if (subscriptionError) throw subscriptionError;

  return {
    displayName: profile?.display_name || "Du",
    email: user.email ?? "",
    plan: subscription ? "Premium" : "Gratis",
    role: user.role,
  };
});

export const getHomeData = cache(async (): Promise<HomeData> => {
  const summary = await getAppUserSummary();
  if (isRequestDemo()) {
    return {
      displayName: summary.displayName,
      activeGoal: {
        title: demoGoals[0].title,
        completedSteps: demoGoals[0].steps.filter((step) => step.completed).length,
        totalSteps: demoGoals[0].steps.length,
      },
      streakCount: 5,
      week: [true, true, false, true, true, false, true],
      reminderTime: demoPreferences.reminderTime,
      streaksEnabled: true,
    };
  }

  const user = await getRequestUser();
  const supabase = await createClient();
  const weekStart = new Date(Date.now() - 7 * 86_400_000).toISOString();
  const [goalResult, streakResult, preferenceResult, ritualResult] =
    await Promise.all([
      supabase
        .from("goals")
        .select("title, goal_steps(completed_at)")
        .eq("user_id", user.id)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("streaks")
        .select("current_count")
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase
        .from("user_preferences")
        .select("reminder_time, streaks_enabled")
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase
        .from("rituals")
        .select("completed_at")
        .eq("user_id", user.id)
        .eq("status", "completed")
        .gte("completed_at", weekStart),
    ]);
  for (const result of [goalResult, streakResult, preferenceResult, ritualResult]) {
    if (result.error) throw result.error;
  }

  const completedDates = new Set(
    (ritualResult.data ?? [])
      .filter((ritual) => ritual.completed_at)
      .map((ritual) => swedishDateKey(ritual.completed_at as string)),
  );
  const week = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(Date.now() - (6 - index) * 86_400_000);
    return completedDates.has(swedishDateKey(date));
  });
  const goalSteps = goalResult.data?.goal_steps ?? [];

  return {
    displayName: summary.displayName,
    activeGoal: goalResult.data
      ? {
          title: goalResult.data.title,
          completedSteps: goalSteps.filter((step) => step.completed_at).length,
          totalSteps: goalSteps.length,
        }
      : undefined,
    streakCount: streakResult.data?.current_count ?? 0,
    week,
    reminderTime: String(preferenceResult.data?.reminder_time ?? "21:30").slice(
      0,
      5,
    ),
    streaksEnabled: preferenceResult.data?.streaks_enabled ?? true,
  };
});

export const getSettingsData = cache(async (): Promise<SettingsData> => {
  const summary = await getAppUserSummary();
  if (isRequestDemo()) {
    return {
      displayName: summary.displayName,
      activeGoal: demoGoals[0].title,
      tone: demoPreferences.tone,
      messageLength: demoPreferences.messageLength,
      reminderTime: demoPreferences.reminderTime,
      remindersEnabled: true,
      streaksEnabled: true,
      personalHistoryEnabled: true,
      areas: demoPreferences.areas,
      theme: "system",
    };
  }

  const user = await getRequestUser();
  const supabase = await createClient();
  const [preferenceResult, goalResult] = await Promise.all([
    supabase
      .from("user_preferences")
      .select(
        "tone, message_length, reminder_time, reminders_enabled, streaks_enabled, personal_history_enabled, support_areas, theme",
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
  if (preferenceResult.error) throw preferenceResult.error;
  if (goalResult.error) throw goalResult.error;
  const preferences = preferenceResult.data;

  return {
    displayName: summary.displayName,
    activeGoal: goalResult.data?.title,
    tone: normalizeTone(preferences?.tone),
    messageLength:
      preferences?.message_length === "utvecklad" ? "utvecklad" : "kort",
    reminderTime: String(preferences?.reminder_time ?? "21:30").slice(0, 5),
    remindersEnabled: preferences?.reminders_enabled ?? false,
    streaksEnabled: preferences?.streaks_enabled ?? true,
    personalHistoryEnabled: preferences?.personal_history_enabled ?? true,
    areas: normalizeAreas(preferences?.support_areas),
    theme:
      preferences?.theme === "light" || preferences?.theme === "dark"
        ? preferences.theme
        : "system",
  };
});
