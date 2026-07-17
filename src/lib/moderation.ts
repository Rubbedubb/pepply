import "server-only";

import { OpenAiProvider } from "@/lib/ai/openai-provider";
import { isDemoMode, serverEnv } from "@/lib/env";
import { logServerError } from "@/lib/logger";
import { getLocalModerationFlags } from "@/lib/moderation-rules";

export async function moderateCommunityContent(text: string): Promise<string[]> {
  const flags = new Set(getLocalModerationFlags(text));

  if (isDemoMode || !serverEnv.OPENAI_API_KEY) return [...flags];

  try {
    const provider = new OpenAiProvider(serverEnv.OPENAI_API_KEY);
    const result = await provider.moderate(text);
    result.categories.forEach((category) => flags.add(`provider:${category}`));
  } catch (error) {
    logServerError("moderation.provider_failed", error);
    flags.add("provider_check_unavailable");
  }

  return [...flags];
}
