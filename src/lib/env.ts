import { z } from "zod";

export const CLOUDFLARE_AI_MODEL =
  "@cf/meta/llama-3.1-8b-instruct-fp8-fast" as const;

const publicSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.url().default("http://localhost:3000"),
  NEXT_PUBLIC_SUPABASE_URL: z.url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
});

const serverSchema = publicSchema.extend({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  CLOUDFLARE_ACCOUNT_ID: z.string().regex(/^[a-f0-9]{32}$/i).optional(),
  CLOUDFLARE_API_TOKEN: z.string().min(20).optional(),
  CLOUDFLARE_AI_MODEL: z
    .literal(CLOUDFLARE_AI_MODEL)
    .default(CLOUDFLARE_AI_MODEL),
  OPENAI_API_KEY: z.string().min(1).optional(),
  OPENAI_MODEL: z.string().default("gpt-5.6-terra"),
  OPENAI_MODERATION_MODEL: z.string().default("omni-moderation-latest"),
  AI_DAILY_USER_LIMIT: z.coerce
    .number()
    .int()
    .positive()
    .default(3)
    .transform((value) => Math.min(value, 3)),
});

export const publicEnv = publicSchema.parse({
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
});

export const serverEnv = serverSchema.parse({
  ...publicEnv,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  CLOUDFLARE_ACCOUNT_ID: process.env.CLOUDFLARE_ACCOUNT_ID,
  CLOUDFLARE_API_TOKEN: process.env.CLOUDFLARE_API_TOKEN,
  CLOUDFLARE_AI_MODEL: process.env.CLOUDFLARE_AI_MODEL,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  OPENAI_MODEL: process.env.OPENAI_MODEL,
  OPENAI_MODERATION_MODEL: process.env.OPENAI_MODERATION_MODEL,
  AI_DAILY_USER_LIMIT: process.env.AI_DAILY_USER_LIMIT,
});

export const isSupabaseConfigured = Boolean(
  publicEnv.NEXT_PUBLIC_SUPABASE_URL &&
    publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

export const isCloudflareAiConfigured = Boolean(
  serverEnv.CLOUDFLARE_ACCOUNT_ID && serverEnv.CLOUDFLARE_API_TOKEN,
);

export const isDemoMode =
  process.env.PEPPLY_DEMO_MODE === "true" ||
  (process.env.NODE_ENV === "development" && !isSupabaseConfigured);
