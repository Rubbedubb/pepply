import { NextResponse } from "next/server";
import { z } from "zod";
import { apiError } from "@/lib/http";
import { isRequestDemo } from "@/lib/request-user";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({ advertisementId: z.uuid() });

export async function POST(request: Request) {
  try {
    const { advertisementId } = schema.parse(await request.json());
    if (!isRequestDemo()) {
      const supabase = await createClient();
      const { error } = await supabase.from("advertisement_impressions").insert({
        advertisement_id: advertisementId,
        occurred_on: new Date().toISOString().slice(0, 10),
      });
      if (error) throw error;
    }
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return apiError(error);
  }
}
