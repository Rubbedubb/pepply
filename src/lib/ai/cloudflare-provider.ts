import "server-only";

import type { AiProvider, AiResult } from "@/lib/ai/provider";
import {
  buildChatInstructions,
  buildRitualPrompt,
  PEPPly_STYLE_GUIDE,
} from "@/lib/ai/prompts";
import type { AiMode, RitualInput } from "@/lib/types";

interface CloudflareAiResponse {
  success?: boolean;
  result?: { response?: string };
  errors?: Array<{ message?: string }>;
}

export class CloudflareAiProvider implements AiProvider {
  constructor(
    private readonly accountId: string,
    private readonly apiToken: string,
    private readonly model: string,
    private readonly mode: AiMode = "direct",
  ) {}

  private async run(
    messages: Array<{ role: "system" | "user" | "assistant"; content: string }>,
    maxTokens: number,
  ): Promise<AiResult> {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/ai/run/${this.model}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages,
          max_tokens: maxTokens,
          temperature: 0.65,
        }),
        cache: "no-store",
        signal: AbortSignal.timeout(this.mode === "advanced" ? 25_000 : 12_000),
      },
    );

    const payload = (await response.json()) as CloudflareAiResponse;
    const text = payload.result?.response?.trim();

    if (!response.ok || !payload.success || !text) {
      const reason = payload.errors?.[0]?.message ?? `HTTP ${response.status}`;
      throw new Error(`Cloudflare Workers AI failed: ${reason}`);
    }

    return { text, provider: "cloudflare-workers-ai", model: this.model };
  }

  generateRitualMessage(input: RitualInput): Promise<AiResult> {
    return this.run(
      [
        { role: "system", content: PEPPly_STYLE_GUIDE },
        { role: "user", content: buildRitualPrompt(input) },
      ],
      input.length === "kort" ? 160 : 240,
    );
  }

  generateChatReply(input: {
    message: string;
    turnCount: number;
    recentMessages?: Array<{ role: "user" | "assistant"; content: string }>;
  }): Promise<AiResult> {
    return this.run(
      [
        {
          role: "system",
          content: buildChatInstructions(input.turnCount, this.mode),
        },
        ...(input.recentMessages ?? []).slice(-6),
        { role: "user", content: input.message },
      ],
      220,
    );
  }

  async moderate(): Promise<{ flagged: boolean; categories: string[] }> {
    // Pepply's deterministic Swedish safety classifier runs before every AI call.
    return { flagged: false, categories: [] };
  }
}
