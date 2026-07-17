import { describe, expect, it } from "vitest";
import { getFallbackPepp } from "@/lib/ai/fallback";
import type { RitualInput } from "@/lib/types";

const baseInput: RitualInput = {
  mood: "Trött",
  question: "Vad tog mest energi i dag?",
  tone: "lugn och mjuk",
  length: "kort",
  areas: ["studier"],
};

describe("getFallbackPepp", () => {
  it("returns a reviewed message without requiring an AI provider", () => {
    const result = getFallbackPepp(baseInput);
    expect(result.source).toBe("fallback");
    expect(result.safetyLevel).toBe("none");
    expect(result.message).toContain("trött");
    expect(result.closing).toContain("i kväll");
  });

  it("uses area-specific copy for an unknown mood", () => {
    const result = getFallbackPepp({ ...baseInput, mood: "Något eget" });
    expect(result.message).toContain("förstod");
  });
});
