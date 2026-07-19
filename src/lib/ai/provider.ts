import type { RitualInput } from "@/lib/types";

export interface AiUsage {
  inputTokens: number;
  outputTokens: number;
  model: string;
}

export interface AiResult {
  text: string;
  usage?: AiUsage;
  provider: string;
  model?: string;
}

export interface AiProvider {
  generateRitualMessage(input: RitualInput): Promise<AiResult>;
  generateChatReply(input: {
    message: string;
    turnCount: number;
    recentMessages?: Array<{ role: "user" | "assistant"; content: string }>;
  }): Promise<AiResult>;
  moderate(text: string): Promise<{ flagged: boolean; categories: string[] }>;
}
