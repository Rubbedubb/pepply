import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { logServerError } from "@/lib/logger";

export function apiError(error: unknown): NextResponse {
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: "Ogiltiga uppgifter.",
        code: "VALIDATION_ERROR",
        fields: error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  if (error instanceof Error && error.message === "UNAUTHENTICATED") {
    return NextResponse.json(
      { error: "Du behöver logga in.", code: "UNAUTHENTICATED" },
      { status: 401 },
    );
  }

  if (error instanceof Error && error.message === "FORBIDDEN") {
    return NextResponse.json(
      { error: "Du har inte behörighet.", code: "FORBIDDEN" },
      { status: 403 },
    );
  }

  if (error instanceof Error && error.message === "RATE_LIMITED") {
    return NextResponse.json(
      {
        error: "Ta en liten paus och försök igen senare.",
        code: "RATE_LIMITED",
      },
      { status: 429 },
    );
  }

  const reference = crypto.randomUUID();
  logServerError("api.unhandled_error", error, { reference });
  return NextResponse.json(
    {
      error: "Något gick fel. Försök igen.",
      code: "INTERNAL_ERROR",
      reference,
    },
    { status: 500 },
  );
}
