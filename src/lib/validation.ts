import { z } from "zod";
import { supportAreas, toneOptions } from "@/lib/types";

export const ritualInputSchema = z.object({
  mood: z.string().trim().min(1).max(40),
  note: z.string().trim().max(600).optional(),
  question: z.string().trim().min(1).max(160),
  tone: z.enum(toneOptions),
  length: z.enum(["kort", "utvecklad"]),
  areas: z.array(z.enum(supportAreas)).min(1).max(7),
  activeGoal: z.string().trim().max(200).optional(),
  recentMessages: z.array(z.string().trim().max(600)).max(5).optional(),
});

export const onboardingSchema = z.object({
  displayName: z.string().trim().min(1).max(60),
  areas: z.array(z.enum(supportAreas)).min(1).max(7),
  tone: z.enum(toneOptions),
  reminderTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  remindersEnabled: z.boolean(),
  messageLength: z.enum(["kort", "utvecklad"]),
  currentGoal: z.string().trim().max(180).optional(),
  consentVersion: z.literal("2026-07-17"),
});

export const feedbackSchema = z.object({
  messageId: z.uuid(),
  helpful: z.boolean(),
  toneAdjustment: z.string().trim().max(80).optional(),
});

export const goalSchema = z.object({
  title: z.string().trim().min(2).max(120),
  description: z.string().trim().max(500).optional(),
  category: z.enum(supportAreas),
  startDate: z.iso.date().optional(),
  frequency: z.string().trim().max(80).optional(),
  endDate: z.iso.date().optional(),
  privateNotes: z.string().trim().max(2000).optional(),
  steps: z.array(z.string().trim().min(1).max(160)).max(12).optional(),
});

export const communitySubmissionSchema = z.object({
  text: z.string().trim().min(20).max(500),
  category: z.enum(supportAreas),
  attribution: z.enum(["anonymous", "display_name"]),
  rightsConfirmed: z.literal(true),
});

export const chatInputSchema = z.object({
  message: z.string().trim().min(1).max(1200),
  conversationId: z.uuid().optional(),
  turnCount: z.number().int().min(0).max(12).default(0),
});
