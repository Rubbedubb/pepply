import { NextResponse } from "next/server";
import { z } from "zod";
import { apiError } from "@/lib/http";
import { logServerError } from "@/lib/logger";
import { enforceRateLimit } from "@/lib/rate-limit";
import { getRequestUser, isRequestDemo } from "@/lib/request-user";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({
  targetType: z.enum(["generated_message", "community_message", "advertisement"]),
  targetId: z.uuid(),
  reason: z.string().trim().min(3).max(500),
});

export async function POST(request: Request) {
  try {
    const user = await getRequestUser();
    const input = schema.parse(await request.json());
    await enforceRateLimit({
      key: `${user.id}:report`,
      action: "content_report",
      limit: 10,
      windowSeconds: 86_400,
    });

    const id = crypto.randomUUID();
    if (!isRequestDemo()) {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("reports")
        .insert({
          reporter_user_id: user.id,
          target_type: input.targetType,
          target_id: input.targetId,
          reason: input.reason,
        })
        .select("id")
        .single();
      if (error) throw error;
      const { error: caseError } = await supabase.from("moderation_cases").insert({
        report_id: data.id,
        status: "open",
      });
      if (caseError) {
        logServerError("report.moderation_case_write_failed", caseError, {
          reportId: data.id,
        });
      }
      return NextResponse.json({ id: data.id, status: "open" }, { status: 201 });
    }

    return NextResponse.json({ id, status: "open" }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
