import { describe, expect, it } from "vitest";
import {
  chatInputSchema,
  communitySubmissionSchema,
  onboardingSchema,
  ritualInputSchema,
} from "@/lib/validation";

describe("input validation", () => {
  it("accepts a minimal ritual input", () => {
    expect(
      ritualInputSchema.safeParse({
        mood: "Lugn",
        question: "Hur känns det?",
        tone: "lugn och mjuk",
        length: "kort",
        areas: ["stress"],
      }).success,
    ).toBe(true);
  });

  it("rejects too much sensitive free text", () => {
    expect(
      ritualInputSchema.safeParse({
        mood: "Tung",
        note: "x".repeat(601),
        question: "Hur känns det?",
        tone: "lugn och mjuk",
        length: "kort",
        areas: ["stress"],
      }).success,
    ).toBe(false);
  });

  it("defaults generation to direct mode and accepts advanced mode", () => {
    const base = {
      mood: "Lugn",
      question: "Hur känns det?",
      tone: "lugn och mjuk" as const,
      length: "kort" as const,
      areas: ["stress" as const],
    };

    expect(ritualInputSchema.parse(base).aiMode).toBe("direct");
    expect(
      ritualInputSchema.parse({ ...base, aiMode: "advanced" }).aiMode,
    ).toBe("advanced");
  });

  it("accepts only bounded, role-safe chat context", () => {
    expect(
      chatInputSchema.safeParse({
        message: "Hur gör jag det mindre?",
        aiMode: "advanced",
        recentMessages: [
          { role: "user", content: "Jag fastnar i matten." },
          { role: "assistant", content: "Vi börjar med en liten del." },
        ],
      }).success,
    ).toBe(true);
    expect(
      chatInputSchema.safeParse({
        message: "Hej",
        recentMessages: Array.from({ length: 7 }, () => ({
          role: "assistant",
          content: "För många meddelanden",
        })),
      }).success,
    ).toBe(false);
  });

  it("requires explicit rights confirmation for community content", () => {
    expect(
      communitySubmissionSchema.safeParse({
        text: "Det är okej att låta den här dagen sluta nu.",
        category: "stress",
        attribution: "anonymous",
        rightsConfirmed: false,
      }).success,
    ).toBe(false);
  });

  it("requires the current consent document version in onboarding", () => {
    expect(
      onboardingSchema.safeParse({
        displayName: "Ruben",
        areas: ["studier"],
        tone: "lugn och mjuk",
        reminderTime: "21:30",
        remindersEnabled: true,
        messageLength: "kort",
        consentVersion: "old",
      }).success,
    ).toBe(false);
  });
});
