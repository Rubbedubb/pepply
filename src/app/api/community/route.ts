import { NextResponse } from "next/server";
import { apiError } from "@/lib/http";
import { logServerError } from "@/lib/logger";
import { moderateCommunityContent } from "@/lib/moderation";
import { enforceRateLimit } from "@/lib/rate-limit";
import { getRequestUser, isRequestDemo } from "@/lib/request-user";
import { createClient } from "@/lib/supabase/server";
import { communitySubmissionSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const user = await getRequestUser();
    const input = communitySubmissionSchema.parse(await request.json());
    await enforceRateLimit({
      key: `${user.id}:community`,
      action: "community_submission",
      limit: 3,
      windowSeconds: 86_400,
    });
    const automatedFlags = await moderateCommunityContent(input.text);

    const id = crypto.randomUUID();
    if (!isRequestDemo()) {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("community_submissions")
        .insert({
          user_id: user.id,
          content: input.text,
          category: input.category,
          attribution: input.attribution,
          rights_confirmed: input.rightsConfirmed,
          status: "pending",
        })
        .select("id")
        .single();
      if (error) throw error;
      const { error: caseError } = await supabase.from("moderation_cases").insert({
        submission_id: data.id,
        automated_flags: automatedFlags,
        status: "open",
      });
      if (caseError) {
        logServerError("community.moderation_case_write_failed", caseError, {
          submissionId: data.id,
        });
      }
      return NextResponse.json({ id: data.id, status: "pending" }, { status: 201 });
    }

    return NextResponse.json({ id, status: "pending" }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
