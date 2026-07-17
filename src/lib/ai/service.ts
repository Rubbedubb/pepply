import "server-only";

import { getFallbackPepp } from "@/lib/ai/fallback";
import { OpenAiProvider } from "@/lib/ai/openai-provider";
import { RITUAL_PROMPT_VERSION } from "@/lib/ai/prompts";
import { isDemoMode, serverEnv } from "@/lib/env";
import { classifySafety, validateGeneratedMessage } from "@/lib/safety/classify";
import type { GeneratedPepp, RitualInput } from "@/lib/types";

export interface RitualGenerationResult extends GeneratedPepp {
  provider?: string;
  usage?: { inputTokens: number; outputTokens: number; model: string };
  safetyReasons?: string[];
}

export async function generateRitualMessage(
  input: RitualInput,
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

  if (isDemoMode || !serverEnv.OPENAI_API_KEY) {
    return getFallbackPepp(input);
  }

  try {
    const provider = new OpenAiProvider(serverEnv.OPENAI_API_KEY);
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
      usage: result.usage,
      promptVersion: RITUAL_PROMPT_VERSION,
      safetyLevel: "none",
    };
  } catch {
    return { ...getFallbackPepp(input), provider: "fallback-provider-error" };
  }
}

export async function generateChatReply(input: {
  message: string;
  turnCount: number;
  recentMessages?: Array<{ role: "user" | "assistant"; content: string }>;
}) {
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

  if (isDemoMode || !serverEnv.OPENAI_API_KEY) {
    return {
      text:
        input.turnCount >= 4
          ? "Det låter som att du redan har ringat in vad som tar mest plats. Välj gärna ett litet nästa steg, skriv ned det och låt samtalet sluta där för stunden."
          : "Vi kan göra det mindre. Vad är den enda del av situationen som känns viktigast att reda ut just nu?",
      safetyLevel: "none" as const,
      provider: "fallback",
    };
  }

  const provider = new OpenAiProvider(serverEnv.OPENAI_API_KEY);
  const result = await provider.generateChatReply(input);
  const validation = validateGeneratedMessage(result.text);
  if (!validation.safe) {
    return {
      text: "Vi kan stanna upp här. Vad skulle vara ett litet och realistiskt nästa steg som inte behöver lösa allt?",
      safetyLevel: "none" as const,
      provider: "fallback-output-guard",
    };
  }

  return { text: result.text, safetyLevel: "none" as const, provider: result.provider };
}
