import "server-only";

import { isDemoMode, isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

interface Bucket {
  count: number;
  resetAt: number;
}

const localBuckets = new Map<string, Bucket>();

export async function enforceRateLimit(options: {
  key: string;
  action: string;
  limit: number;
  windowSeconds: number;
}): Promise<void> {
  if (isDemoMode || !isSupabaseConfigured) {
    const now = Date.now();
    const current = localBuckets.get(options.key);
    if (!current || current.resetAt <= now) {
      localBuckets.set(options.key, {
        count: 1,
        resetAt: now + options.windowSeconds * 1000,
      });
      return;
    }
    if (current.count >= options.limit) throw new Error("RATE_LIMITED");
    current.count += 1;
    return;
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("consume_rate_limit", {
    p_key: options.key,
    p_action: options.action,
    p_limit: options.limit,
    p_window_seconds: options.windowSeconds,
  });

  if (error) throw error;
  if (data !== true) throw new Error("RATE_LIMITED");
}
