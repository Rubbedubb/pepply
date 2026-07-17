import { NextResponse } from "next/server";
import { z } from "zod";
import { apiError } from "@/lib/http";
import { getRequestUser } from "@/lib/request-user";

const schema = z.object({ productId: z.string().min(1).max(80) });

export async function POST(request: Request) {
  try {
    await getRequestUser();
    schema.parse(await request.json());

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        {
          error: "Betalningsleverantören är inte aktiverad i den här miljön.",
          code: "BILLING_NOT_CONFIGURED",
        },
        { status: 501 },
      );
    }

    return NextResponse.json(
      {
        error: "Stripe-adaptern är förberedd men måste implementeras och granskas innan lansering.",
        code: "BILLING_ADAPTER_PENDING",
      },
      { status: 501 },
    );
  } catch (error) {
    return apiError(error);
  }
}
