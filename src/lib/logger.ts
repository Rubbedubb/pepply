import "server-only";

type SafeContext = Record<string, boolean | number | string | null | undefined>;

function describeError(error: unknown) {
  if (!(error instanceof Error)) return { errorType: "UnknownError" };

  const possibleCode = (error as Error & { code?: unknown }).code;
  return {
    errorType: error.name || "Error",
    errorCode:
      typeof possibleCode === "string" || typeof possibleCode === "number"
        ? String(possibleCode)
        : undefined,
  };
}

/**
 * Emits JSON that can be consumed by a log platform. Context must never contain
 * request bodies, ritual notes, chat messages, e-mail addresses or access tokens.
 */
export function logServerError(
  event: string,
  error: unknown,
  context: SafeContext = {},
) {
  console.error(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      level: "error",
      event,
      ...describeError(error),
      ...context,
    }),
  );
}
