import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/env", () => ({
  isDemoMode: true,
  isSupabaseConfigured: false,
}));
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

import { tryConsumeRateLimit } from "@/lib/rate-limit";

describe("tryConsumeRateLimit", () => {
  it("returns false after the configured local allowance", async () => {
    const options = {
      key: `user-${crypto.randomUUID()}:ai`,
      action: "ai_generation",
      limit: 3,
      windowSeconds: 86_400,
    };

    await expect(tryConsumeRateLimit(options)).resolves.toBe(true);
    await expect(tryConsumeRateLimit(options)).resolves.toBe(true);
    await expect(tryConsumeRateLimit(options)).resolves.toBe(true);
    await expect(tryConsumeRateLimit(options)).resolves.toBe(false);
  });

  it("keeps separate actions in separate buckets", async () => {
    const key = `user-${crypto.randomUUID()}`;
    const base = { key, limit: 1, windowSeconds: 86_400 };

    await expect(
      tryConsumeRateLimit({ ...base, action: "ritual" }),
    ).resolves.toBe(true);
    await expect(
      tryConsumeRateLimit({ ...base, action: "ritual" }),
    ).resolves.toBe(false);
    await expect(
      tryConsumeRateLimit({ ...base, action: "community" }),
    ).resolves.toBe(true);
  });
});
