import "server-only";

import { CloudflareAiProvider } from "@/lib/ai/cloudflare-provider";
import { getFallbackChatReply, getFallbackPepp } from "@/lib/ai/fallback";
import { getCloudflareAiModel } from "@/lib/ai/models";
import type { AiProvider } from "@/lib/ai/provider";
import { RITUAL_PROMPT_VERSION } from "@/lib/ai/prompts";
import { isCloudflareAiConfigured, serverEnv } from "@/lib/env";
import { classifySafety, validateGeneratedMessage } from "@/lib/safety/classify";
import type { AiMode, GeneratedPepp, RitualInput } from "@/lib/types";

export interface RitualGenerationResult extends GeneratedPepp {
  provider?: string;
  usage?: { inputTokens: number; outputTokens: number; model: string };
  model?: string;
  safetyReasons?: string[];
}

function createAiProvider(mode: AiMode): AiProvider | null {
  if (
    isCloudflareAiConfigured &&
    serverEnv.CLOUDFLARE_ACCOUNT_ID &&
    serverEnv.CLOUDFLARE_API_TOKEN
  ) {
    return new CloudflareAiProvider(
      serverEnv.CLOUDFLARE_ACCOUNT_ID,
      serverEnv.CLOUDFLARE_API_TOKEN,
      getCloudflareAiModel(mode),
      mode,
    );
  }

  return null;
}

interface GenerationOptions {
  allowAi?: boolean;
  aiMode?: AiMode;
}

export async function generateRitualMessage(
  input: RitualInput,
  options: GenerationOptions = {},
): Promise<RitualGenerationResult> {
  const assessment = classifySafety(`${input.mood}\n${input.note ?? ""}`);

  if (assessment.level !== "none") {
    return {
      message:
        assessment.level === "urgent"
          ? "Det du skriver låter som att du kan vara i fara just nu. Försök att inte vara ensam med detta. Ring 112 om du kan skada dig själv nu, eller kontakta genast en person du litar på och be dem stanna hos dig."
          : "Det du skriver behöver tas på allvar. Berätta gärna för en person du litar på hur du mår och kontakta vården eller en stödlinje. Om du kan vara i omedelbar fara ska du ringa 112.",
      closing: "Du ska inte behöva bära det här ensam just nu.",
      source: "professional",
      promptVersion: RITUAL_PROMPT_VERSION,
      safetyLevel: assessment.level,
      safetyReasons: assessment.reasons,
    };
  }

  if (options.allowAi === false) {
    return { ...getFallbackPepp(input), provider: "fallback-daily-limit" };
  }

  const provider = createAiProvider(options.aiMode ?? "direct");
  if (!provider) {
    return { ...getFallbackPepp(input), provider: "fallback-not-configured" };
  }

  try {
    const result = await provider.generateRitualMessage(input);
    const validation = validateGeneratedMessage(result.text);

    if (!validation.safe) {
      return { ...getFallbackPepp(input), provider: "fallback-output-guard" };
    }

    return {
      message: result.text,
      closing: "Det räcker för i kväll. Ta hand om dig.",
      source: "ai",
      provider: result.provider,
      model: result.model,
      usage: result.usage,
      promptVersion: RITUAL_PROMPT_VERSION,
      safetyLevel: "none",
    };
  } catch {
    return { ...getFallbackPepp(input), provider: "fallback-provider-error" };
  }
}

export async function generateChatReply(
  input: {
    message: string;
    turnCount: number;
    recentMessages?: Array<{ role: "user" | "assistant"; content: string }>;
  },
  options: GenerationOptions = {},
) {
  const safety = classifySafety(input.message);
  if (safety.level !== "none") {
    return {
      text:
        safety.level === "urgent"
          ? "Det låter som att du kan vara i fara just nu. Ring 112 om du kan skada dig själv, eller kontakta genast någon du litar på och be personen stanna hos dig. Du kan också ringa 1177 eller Mind Självmordslinjen på 90 101."
          : "Det du skriver behöver tas på allvar. Försök berätta för någon du litar på hur du mår. Du kan ringa 1177 för vårdråd eller Mind Självmordslinjen på 90 101. Vid omedelbar fara, ring 112.",
      safetyLevel: safety.level,
      provider: "safety",
    };
  }

  if (options.allowAi === false) {
    return {
      text: getFallbackChatReply(input.turnCount),
      safetyLevel: "none" as const,
      provider: "fallback-daily-limit",
    };
  }

  const provider = createAiProvider(options.aiMode ?? "direct");
  if (!provider) {
    return {
      text: getFallbackChatReply(input.turnCount),
      safetyLevel: "none" as const,
      provider: "fallback-not-configured",
    };
  }

  try {
    const result = await provider.generateChatReply(input);
    const validation = validateGeneratedMessage(result.text);
    if (!validation.safe) {
      return {
        text: "Vi kan stanna upp här. Vad skulle vara ett litet och realistiskt nästa steg som inte behöver lösa allt?",
        safetyLevel: "none" as const,
        provider: "fallback-output-guard",
      };
    }

    return {
      text: result.text,
      safetyLevel: "none" as const,
      provider: result.provider,
      model: result.model,
    };
  } catch {
    return {
      text: getFallbackChatReply(input.turnCount),
      safetyLevel: "none" as const,
      provider: "fallback-provider-error",
    };
  }
}
