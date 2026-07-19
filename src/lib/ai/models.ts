import type { AiMode } from "@/lib/types";

export const CLOUDFLARE_AI_MODELS = {
  direct: "@cf/meta/llama-3.1-8b-instruct-fp8-fast",
  advanced: "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
} as const satisfies Record<AiMode, string>;

export function getCloudflareAiModel(mode: AiMode): string {
  return CLOUDFLARE_AI_MODELS[mode];
}
