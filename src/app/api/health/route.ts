import { NextResponse } from "next/server";
import { isDemoMode, isSupabaseConfigured, serverEnv } from "@/lib/env";

export function GET() {
  return NextResponse.json({
    status: "ok",
    mode: isDemoMode ? "demo" : "production",
    integrations: {
      database: isSupabaseConfigured,
      ai: Boolean(serverEnv.OPENAI_API_KEY),
      payments: Boolean(process.env.STRIPE_SECRET_KEY),
      push: Boolean(process.env.VAPID_PRIVATE_KEY),
    },
    timestamp: new Date().toISOString(),
  });
}
