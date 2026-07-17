import { describe, expect, it } from "vitest";
import { getLocalModerationFlags } from "@/lib/moderation-rules";

describe("community moderation rules", () => {
  it("allows grounded, original encouragement", () => {
    expect(
      getLocalModerationFlags(
        "Det som blev ofärdigt i dag får vänta tills du har mer kraft.",
      ),
    ).toEqual([]);
  });

  it.each([
    ["Skriv till mig på test@example.se", "possible_personal_data"],
    ["Köp nu med rabattkod PEPP", "possible_advertising"],
    ["Du har depression och detta botar den", "medical_claim"],
    ["Allt kommer säkert bra, jag lovar", "unsafe_promise"],
    ["Här är instruktioner för självmord", "possible_self_harm_instruction"],
  ])("flags %s", (text, expected) => {
    expect(getLocalModerationFlags(text)).toContain(expected);
  });
});
