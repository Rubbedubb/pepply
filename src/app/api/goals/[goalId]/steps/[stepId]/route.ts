import { NextResponse } from "next/server";
import { z } from "zod";
import { apiError } from "@/lib/http";
import { getRequestUser, isRequestDemo } from "@/lib/request-user";
import { createClient } from "@/lib/supabase/server";

const bodySchema = z.object({ completed: z.boolean() });
const paramsSchema = z.object({ goalId: z.uuid(), stepId: z.uuid() });

export async function PATCH(
  request: Request,
  context: { params: Promise<{ goalId: string; stepId: string }> },
) {
  try {
    const user = await getRequestUser();
    const input = bodySchema.parse(await request.json());
    const rawParams = await context.params;

    if (isRequestDemo()) {
      return NextResponse.json({
        id: rawParams.stepId,
        completed: input.completed,
      });
    }

    const { goalId, stepId } = paramsSchema.parse(rawParams);
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("goal_steps")
      .update({ completed_at: input.completed ? new Date().toISOString() : null })
      .eq("id", stepId)
      .eq("goal_id", goalId)
      .eq("user_id", user.id)
      .select("id, completed_at")
      .single();
    if (error) throw error;

    return NextResponse.json({
      id: data.id,
      completed: Boolean(data.completed_at),
    });
  } catch (error) {
    return apiError(error);
  }
}
