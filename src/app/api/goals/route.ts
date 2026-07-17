import { NextResponse } from "next/server";
import { demoGoals } from "@/lib/demo-data";
import { apiError } from "@/lib/http";
import { getRequestUser, isRequestDemo } from "@/lib/request-user";
import { createClient } from "@/lib/supabase/server";
import { goalSchema } from "@/lib/validation";

interface GoalRow {
  id: string;
  title: string;
  description: string | null;
  category: string;
  frequency: string | null;
  status: "active" | "paused" | "completed";
  goal_steps?: Array<{
    id: string;
    title: string;
    completed_at: string | null;
    position: number;
  }>;
}

function toGoalDto(row: GoalRow) {
  const orderedSteps = [...(row.goal_steps ?? [])].sort(
    (left, right) => left.position - right.position,
  );
  const completed = orderedSteps.filter((step) => step.completed_at).length;

  return {
    id: row.id,
    title: row.title,
    description: row.description ?? undefined,
    category: row.category,
    frequency: row.frequency ?? undefined,
    status: row.status,
    progress: orderedSteps.length
      ? Math.round((completed / orderedSteps.length) * 100)
      : 0,
    steps: orderedSteps.map((step) => ({
      id: step.id,
      title: step.title,
      completed: Boolean(step.completed_at),
    })),
  };
}

export async function GET() {
  try {
    const user = await getRequestUser();
    if (isRequestDemo()) return NextResponse.json({ goals: demoGoals });

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("goals")
      .select(
        "id, title, description, category, frequency, status, goal_steps(id, title, completed_at, position)",
      )
      .eq("user_id", user.id)
      .neq("status", "archived")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return NextResponse.json({ goals: (data as GoalRow[]).map(toGoalDto) });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await getRequestUser();
    const input = goalSchema.parse(await request.json());
    if (isRequestDemo()) {
      const stepId = crypto.randomUUID();
      return NextResponse.json(
        {
          goal: {
            id: crypto.randomUUID(),
            title: input.title,
            description: input.description,
            category: input.category,
            frequency: input.frequency,
            status: "active",
            progress: 0,
            steps: [
              {
                id: stepId,
                title:
                  input.steps?.[0] ??
                  "Bestäm minsta möjliga första steg",
                completed: false,
              },
            ],
          },
        },
        { status: 201 },
      );
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("goals")
      .insert({
        user_id: user.id,
        title: input.title,
        description: input.description ?? null,
        category: input.category,
        start_date: input.startDate ?? new Date().toISOString().slice(0, 10),
        end_date: input.endDate ?? null,
        frequency: input.frequency ?? null,
        private_notes: input.privateNotes ?? null,
        status: "active",
      })
      .select("id, title, description, category, frequency, status")
      .single();
    if (error) throw error;

    const stepTitles = input.steps?.length
      ? input.steps
      : ["Bestäm minsta möjliga första steg"];
    const { data: steps, error: stepsError } = await supabase
      .from("goal_steps")
      .insert(
        stepTitles.map((title, position) => ({
          user_id: user.id,
          goal_id: data.id,
          title,
          position,
        })),
      )
      .select("id, title, completed_at, position");
    if (stepsError) {
      await supabase
        .from("goals")
        .delete()
        .eq("id", data.id)
        .eq("user_id", user.id);
      throw stepsError;
    }

    return NextResponse.json(
      {
        goal: toGoalDto({
          ...(data as GoalRow),
          goal_steps: steps ?? [],
        }),
      },
      { status: 201 },
    );
  } catch (error) {
    return apiError(error);
  }
}
