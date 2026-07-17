import { describe, expect, it } from "vitest";
import { buildChatInstructions, buildRitualPrompt, PEPPly_STYLE_GUIDE } from "@/lib/ai/prompts";

describe("Pepply prompts", () => {
  it("contains the central safety and tone constraints", () => {
    expect(PEPPly_STYLE_GUIDE).toContain("Diagnostisera inte");
    expect(PEPPly_STYLE_GUIDE).toContain("Inga utropstecken");
    expect(PEPPly_STYLE_GUIDE).toContain("älskar");
  });

  it("includes only bounded relevant ritual context", () => {
    const prompt = buildRitualPrompt({
      mood: "Okej",
      note: "Matten tog tid",
      question: "Vad tog mest energi i dag?",
      tone: "rak och ärlig",
      length: "kort",
      areas: ["studier"],
      activeGoal: "Göra två tal",
      recentMessages: ["Du behöver inte lösa allt."],
      recentFeedback: [
        { message: "Ett litet steg får räcka.", helpful: true },
      ],
    });
    expect(prompt).toContain("Matten tog tid");
    expect(prompt).toContain("Göra två tal");
    expect(prompt).toContain("45–75 ord");
    expect(prompt).toContain("Hjälpte: Ett litet steg får räcka.");
  });

  it("encourages a stopping point after several chat turns", () => {
    expect(buildChatInstructions(5)).toContain("avslutar för stunden");
    expect(buildChatInstructions(1)).not.toContain("avslutar för stunden");
  });
});
