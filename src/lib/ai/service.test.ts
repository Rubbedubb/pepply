import { beforeEach, describe, expect, it, vi } from "vitest";

const providerMocks = vi.hoisted(() => ({
  ritual: vi.fn(),
  chat: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/env", () => ({
  isCloudflareAiConfigured: true,
  serverEnv: {
    CLOUDFLARE_ACCOUNT_ID: "a".repeat(32),
    CLOUDFLARE_API_TOKEN: "server-secret-token",
    CLOUDFLARE_AI_MODEL: "@cf/meta/llama-3.1-8b-instruct-fp8-fast",
  },
}));
vi.mock("@/lib/ai/cloudflare-provider", () => ({
  CloudflareAiProvider: class {
    generateRitualMessage = providerMocks.ritual;
    generateChatReply = providerMocks.chat;
    moderate = vi.fn();
  },
}));

import { generateChatReply, generateRitualMessage } from "@/lib/ai/service";
import type { RitualInput } from "@/lib/types";

const ritualInput: RitualInput = {
  mood: "Trött",
  note: "Matten tog mycket energi.",
  question: "Vad tog mest energi i dag?",
  tone: "lugn och mjuk",
  length: "kort",
  areas: ["studier"],
};

describe("AI service safeguards", () => {
  beforeEach(() => {
    providerMocks.ritual.mockReset();
    providerMocks.chat.mockReset();
    providerMocks.ritual.mockResolvedValue({
      text: "Du behöver inte lösa resten i kväll. Låt matten vänta tills du har fått vila.",
      provider: "cloudflare-workers-ai",
    });
    providerMocks.chat.mockResolvedValue({
      text: "Vi kan börja mindre. Vilken enda del känns viktigast att reda ut just nu?",
      provider: "cloudflare-workers-ai",
    });
  });

  it("uses Cloudflare for an ordinary ritual within the daily limit", async () => {
    const result = await generateRitualMessage(ritualInput, { allowAi: true });

    expect(result.source).toBe("ai");
    expect(result.provider).toBe("cloudflare-workers-ai");
    expect(providerMocks.ritual).toHaveBeenCalledOnce();
  });

  it("uses a reviewed ritual fallback when the daily limit is reached", async () => {
    const result = await generateRitualMessage(ritualInput, { allowAi: false });

    expect(result.source).toBe("fallback");
    expect(result.provider).toBe("fallback-daily-limit");
    expect(providerMocks.ritual).not.toHaveBeenCalled();
  });

  it("always prioritizes urgent safety copy without calling AI", async () => {
    const result = await generateRitualMessage(
      {
        ...ritualInput,
        note: "Jag tänker ta livet av mig ikväll",
      },
      { allowAi: false },
    );

    expect(result.safetyLevel).toBe("urgent");
    expect(result.source).toBe("professional");
    expect(providerMocks.ritual).not.toHaveBeenCalled();
  });

  it("falls back when Cloudflare reports an error", async () => {
    providerMocks.ritual.mockRejectedValue(new Error("quota"));

    const result = await generateRitualMessage(ritualInput, { allowAi: true });

    expect(result.source).toBe("fallback");
    expect(result.provider).toBe("fallback-provider-error");
  });

  it("uses a reviewed chat fallback instead of returning a quota error", async () => {
    const result = await generateChatReply(
      { message: "Jag fastnar i matten", turnCount: 1 },
      { allowAi: false },
    );

    expect(result.provider).toBe("fallback-daily-limit");
    expect(result.text).toContain("viktigast");
    expect(providerMocks.chat).not.toHaveBeenCalled();
  });
});
