import { NextResponse } from "next/server";
import {
  isCloudflareAiConfigured,
  isDemoMode,
  isSupabaseConfigured,
} from "@/lib/env";
import { CLOUDFLARE_AI_MODELS } from "@/lib/ai/models";

export function GET() {
  return NextResponse.json({
    status: "ok",
    mode: isDemoMode ? "demo" : "production",
    integrations: {
      database: isSupabaseConfigured,
      ai: isCloudflareAiConfigured,
      aiProvider: isCloudflareAiConfigured ? "cloudflare-workers-ai" : null,
      aiModels: isCloudflareAiConfigured ? CLOUDFLARE_AI_MODELS : null,
      payments: Boolean(process.env.STRIPE_SECRET_KEY),
      push: Boolean(process.env.VAPID_PRIVATE_KEY),
    },
    timestamp: new Date().toISOString(),
  });
}
