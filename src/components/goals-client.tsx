"use client";

import { Check, ChevronDown, Goal as GoalIcon, Plus, RotateCcw, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormField, Input } from "@/components/ui/form-field";
import { demoGoals } from "@/lib/demo-data";
import { supportAreas, type Goal, type SupportArea } from "@/lib/types";

export function GoalsClient() {
  const [goals, setGoals] = useState<Goal[]>(demoGoals);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<SupportArea>("vardagsmotivation");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/goals")
      .then(async (response) => {
        if (!response.ok) throw new Error("goals_load_failed");
        return (await response.json()) as { goals: Goal[] };
      })
      .then((payload) => {
        if (active) setGoals(payload.goals);
      })
      .catch(() => {
        if (active) setError("Målen kunde inte hämtas just nu.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  function toggleStep(goalId: string, stepId: string) {
    const currentStep = goals
      .find((goal) => goal.id === goalId)
      ?.steps.find((step) => step.id === stepId);
    if (!currentStep) return;
    const completed = !currentStep.completed;

    setGoals((current) =>
      current.map((goal) => {
        if (goal.id !== goalId) return goal;
        const steps = goal.steps.map((step) =>
          step.id === stepId ? { ...step, completed: !step.completed } : step,
        );
        const progress = steps.length
          ? Math.round((steps.filter((step) => step.completed).length / steps.length) * 100)
          : 0;
        return { ...goal, steps, progress };
      }),
    );

    fetch(`/api/goals/${goalId}/steps/${stepId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed }),
    }).then((response) => {
      if (!response.ok) {
        setError("Delsteget kunde inte sparas.");
        setGoals((current) =>
          current.map((goal) => {
            if (goal.id !== goalId) return goal;
            const steps = goal.steps.map((step) =>
              step.id === stepId
                ? { ...step, completed: currentStep.completed }
                : step,
            );
            const progress = steps.length
              ? Math.round(
                  (steps.filter((step) => step.completed).length /
                    steps.length) *
                    100,
                )
              : 0;
            return { ...goal, steps, progress };
          }),
        );
      }
    }).catch(() => setError("Delsteget kunde inte sparas."));
  }

  async function addGoal(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const response = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), category }),
      });
      if (!response.ok) throw new Error("goal_create_failed");
      const payload = (await response.json()) as { goal: Goal };
      setGoals((current) => [payload.goal, ...current]);
      setTitle("");
      setShowForm(false);
    } catch {
      setError("Målet kunde inte skapas just nu.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      {error ? (
        <p role="alert" className="mb-5 rounded-2xl bg-red-50 p-4 text-sm text-danger dark:bg-red-950/30">
          {error}
        </p>
      ) : null}
      {showForm ? (
        <Card className="mb-6 border-brand/40 bg-surface-soft">
          <form onSubmit={addGoal}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">Skapa ett litet mål</h2>
                <p className="mt-1 text-sm leading-6 text-muted">Formulera något du kan börja med, inte allt du måste bli.</p>
              </div>
              <button type="button" onClick={() => setShowForm(false)} className="grid size-10 place-items-center rounded-full hover:bg-surface-muted" aria-label="Stäng formuläret">
                <X aria-hidden="true" size={19} />
              </button>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-[1fr_14rem]">
              <FormField label="Vad vill du göra?">
                <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Till exempel läsa i 15 minuter" maxLength={120} autoFocus />
              </FormField>
              <FormField label="Område">
                <div className="relative">
                  <select value={category} onChange={(event) => setCategory(event.target.value as SupportArea)} className="min-h-12 w-full appearance-none rounded-2xl border border-border bg-surface px-4 pr-10 text-sm">
                    {supportAreas.map((area) => <option key={area} value={area}>{area}</option>)}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-3.5 text-muted" aria-hidden="true" size={18} />
                </div>
              </FormField>
            </div>
            <Button type="submit" className="mt-5" disabled={!title.trim() || saving}>
              <Plus aria-hidden="true" size={18} /> {saving ? "Skapar…" : "Skapa mål"}
            </Button>
          </form>
        </Card>
      ) : null}

      {loading ? (
        <Card className="mb-5 text-sm text-muted" role="status">Hämtar dina mål…</Card>
      ) : null}

      <div className="grid gap-5 md:grid-cols-2">
        {goals.map((goal) => (
          <Card key={goal.id} className="flex flex-col">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-brand-strong">{goal.category}</span>
                <h2 className="mt-2 text-xl font-semibold tracking-tight">{goal.title}</h2>
                {goal.description ? <p className="mt-2 text-sm leading-6 text-muted">{goal.description}</p> : null}
              </div>
              <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-brand-soft text-brand-strong">
                <GoalIcon aria-hidden="true" size={19} />
              </span>
            </div>

            <div className="mt-6">
              <div className="mb-2 flex justify-between text-xs font-semibold text-muted">
                <span>Små steg</span><span>{goal.progress}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-surface-muted">
                <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${goal.progress}%` }} />
              </div>
            </div>

            <ul className="mt-5 space-y-2">
              {goal.steps.map((step) => (
                <li key={step.id}>
                  <button type="button" onClick={() => toggleStep(goal.id, step.id)} className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left text-sm hover:bg-surface-muted">
                    <span className={`grid size-6 shrink-0 place-items-center rounded-lg border ${step.completed ? "border-success bg-[#e5f2e8] text-success dark:bg-[#203a27]" : "border-border"}`}>
                      {step.completed ? <Check aria-hidden="true" size={14} /> : null}
                    </span>
                    <span className={step.completed ? "text-muted line-through" : ""}>{step.title}</span>
                  </button>
                </li>
              ))}
            </ul>

            <p className="mt-auto flex items-center gap-2 border-t border-border pt-5 text-xs leading-5 text-muted">
              <RotateCcw aria-hidden="true" size={15} /> Du har inte förlorat det du redan gjort. Börja från i dag.
            </p>
          </Card>
        ))}
      </div>

      {!showForm ? (
        <button type="button" onClick={() => setShowForm(true)} className="mt-5 flex min-h-24 w-full items-center justify-center gap-2 rounded-[1.5rem] border border-dashed border-border text-sm font-semibold text-muted transition hover:bg-surface-muted hover:text-foreground">
          <Plus aria-hidden="true" size={18} /> Skapa ett nytt mål
        </button>
      ) : null}
    </div>
  );
}
