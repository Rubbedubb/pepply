import "server-only";

import OpenAI from "openai";
import type { AiProvider, AiResult } from "@/lib/ai/provider";
import {
  buildChatInstructions,
  buildRitualPrompt,
  PEPPly_STYLE_GUIDE,
} from "@/lib/ai/prompts";
import { serverEnv } from "@/lib/env";
import type { RitualInput } from "@/lib/types";

export class OpenAiProvider implements AiProvider {
  private readonly client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  async generateRitualMessage(input: RitualInput): Promise<AiResult> {
    const response = await this.client.responses.create({
      model: serverEnv.OPENAI_MODEL,
      instructions: PEPPly_STYLE_GUIDE,
      input: buildRitualPrompt(input),
      max_output_tokens: input.length === "kort" ? 220 : 320,
      store: false,
    });

    return {
      text: response.output_text.trim(),
      provider: "openai",
      usage: response.usage
        ? {
            inputTokens: response.usage.input_tokens,
            outputTokens: response.usage.output_tokens,
            model: serverEnv.OPENAI_MODEL,
          }
        : undefined,
    };
  }

  async generateChatReply(input: {
    message: string;
    turnCount: number;
    recentMessages?: Array<{ role: "user" | "assistant"; content: string }>;
  }): Promise<AiResult> {
    const history = (input.recentMessages ?? []).slice(-6).map((item) => ({
      role: item.role,
      content: item.content,
    }));

    const response = await this.client.responses.create({
      model: serverEnv.OPENAI_MODEL,
      instructions: buildChatInstructions(input.turnCount),
      input: [...history, { role: "user" as const, content: input.message }],
      max_output_tokens: 320,
      store: false,
    });

    return {
      text: response.output_text.trim(),
      provider: "openai",
      usage: response.usage
        ? {
            inputTokens: response.usage.input_tokens,
            outputTokens: response.usage.output_tokens,
            model: serverEnv.OPENAI_MODEL,
          }
        : undefined,
    };
  }

  async moderate(text: string): Promise<{
    flagged: boolean;
    categories: string[];
  }> {
    const response = await this.client.moderations.create({
      model: serverEnv.OPENAI_MODERATION_MODEL,
      input: text,
    });
    const result = response.results[0];
    const categoryEntries = Object.entries(result.categories as unknown as Record<string, boolean>);

    return {
      flagged: result.flagged,
      categories: categoryEntries
        .filter(([, flagged]) => flagged)
        .map(([category]) => category),
    };
  }
}
