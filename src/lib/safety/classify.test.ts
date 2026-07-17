import { describe, expect, it } from "vitest";
import { classifySafety, validateGeneratedMessage } from "@/lib/safety/classify";

describe("classifySafety", () => {
  it("does not flag ordinary difficult-day language", () => {
    expect(classifySafety("Jag är trött och skolan tog all energi").level).toBe("none");
  });

  it("flags concerning self-harm language", () => {
    const result = classifySafety("Ibland vill jag inte leva");
    expect(result.level).toBe("concern");
    expect(result.shouldBypassGeneration).toBe(false);
  });

  it("bypasses ordinary generation for possible immediate intent", () => {
    const result = classifySafety("Jag tänker ta livet av mig ikväll");
    expect(result.level).toBe("urgent");
    expect(result.shouldBypassGeneration).toBe(true);
    expect(result.reasons).toContain("possible_immediacy_or_plan");
  });

  it("detects an explicit negation and avoids urgent classification", () => {
    const result = classifySafety("Jag vill inte dö, men tanken skrämde mig");
    expect(result.level).toBe("concern");
    expect(result.reasons).toContain("explicit_negation_detected");
  });
});

describe("validateGeneratedMessage", () => {
  it("accepts a grounded Pepply message", () => {
    expect(
      validateGeneratedMessage(
        "Du behöver inte lösa resten i kväll. Låt en sak vänta tills du har fått vila.",
      ).safe,
    ).toBe(true);
  });

  it.each([
    "Jag älskar dig och jag lämnar dig aldrig, så du behöver inte vara rädd.",
    "Allt kommer bli bra och du kan klara precis allt som händer i morgon.",
    "Du har depression och behöver förstå att det är därför du känner så här.",
  ])("rejects prohibited dependency, certainty, or diagnosis language", (message) => {
    expect(validateGeneratedMessage(message).safe).toBe(false);
  });
});
