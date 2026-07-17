import "server-only";

import { isDemoMode, isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

interface Bucket {
  count: number;
  resetAt: number;
}

const localBuckets = new Map<string, Bucket>();

interface RateLimitOptions {
  key: string;
  action: string;
  limit: number;
  windowSeconds: number;
}

export async function tryConsumeRateLimit(
  options: RateLimitOptions,
): Promise<boolean> {
  if (isDemoMode || !isSupabaseConfigured) {
    const now = Date.now();
    const bucketKey = `${options.key}:${options.action}`;
    const current = localBuckets.get(bucketKey);
    if (!current || current.resetAt <= now) {
      localBuckets.set(bucketKey, {
        count: 1,
        resetAt: now + options.windowSeconds * 1000,
      });
      return true;
    }
    if (current.count >= options.limit) return false;
    current.count += 1;
    return true;
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("consume_rate_limit", {
    p_key: options.key,
    p_action: options.action,
    p_limit: options.limit,
    p_window_seconds: options.windowSeconds,
  });

  if (error) throw error;
  return data === true;
}

export async function enforceRateLimit(
  options: RateLimitOptions,
): Promise<void> {
  if (!(await tryConsumeRateLimit(options))) {
    throw new Error("RATE_LIMITED");
  }
}
