import { NextResponse } from "next/server";
import { z } from "zod";
import { apiError } from "@/lib/http";
import { getRequestUserWithRole, isRequestDemo } from "@/lib/request-user";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({
  decision: z.enum(["approved", "rejected"]),
  reason: z.string().trim().max(500).optional(),
});

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const moderator = await getRequestUserWithRole(["moderator", "admin"]);
    const { id } = await context.params;
    const input = schema.parse(await request.json());

    if (!isRequestDemo()) {
      const supabase = await createClient();
      const { data: submission, error: submissionError } = await supabase
        .from("community_submissions")
        .update({
          status: input.decision,
          moderated_at: new Date().toISOString(),
          moderated_by: moderator.id,
          moderation_reason: input.reason ?? null,
        })
        .eq("id", id)
        .eq("status", "pending")
        .select("id, content, category, user_id, attribution")
        .single();
      if (submissionError) throw submissionError;

      if (input.decision === "approved") {
        const { error: publishError } = await supabase
          .from("community_messages")
          .insert({
            submission_id: submission.id,
            author_user_id: submission.user_id,
            content: submission.content,
            category: submission.category,
            attribution: submission.attribution,
            published: true,
          });
        if (publishError) throw publishError;
      }

      const { error: caseError } = await supabase
        .from("moderation_cases")
        .update({
          status: "resolved",
          assigned_to: moderator.id,
          decision: input.decision,
          notes: input.reason ?? null,
        })
        .eq("submission_id", id);
      if (caseError) throw caseError;

      const { error: auditError } = await supabase.from("audit_logs").insert({
        actor_user_id: moderator.id,
        action: `community_submission.${input.decision}`,
        target_type: "community_submission",
        target_id: id,
        metadata: { reason: input.reason ?? null },
      });
      if (auditError) throw auditError;
    }

    return NextResponse.json({ id, status: input.decision });
  } catch (error) {
    return apiError(error);
  }
}
