import { NextResponse } from "next/server";
import {
  isCloudflareAiConfigured,
  isDemoMode,
  isSupabaseConfigured,
} from "@/lib/env";

export function GET() {
  return NextResponse.json({
    status: "ok",
    mode: isDemoMode ? "demo" : "production",
    integrations: {
      database: isSupabaseConfigured,
      ai: isCloudflareAiConfigured,
      aiProvider: isCloudflareAiConfigured ? "cloudflare-workers-ai" : null,
      payments: Boolean(process.env.STRIPE_SECRET_KEY),
      push: Boolean(process.env.VAPID_PRIVATE_KEY),
    },
    timestamp: new Date().toISOString(),
  });
}
