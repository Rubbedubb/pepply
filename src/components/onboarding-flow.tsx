"use client";

import { ArrowLeft, ArrowRight, Check, LoaderCircle, LockKeyhole } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FormField, Input } from "@/components/ui/form-field";
import { cn } from "@/lib/cn";
import { supportAreas, toneOptions, type MessageLength, type SupportArea, type ToneOption } from "@/lib/types";

const totalSteps = 4;

export function OnboardingFlow() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [displayName, setDisplayName] = useState("");
  const [areas, setAreas] = useState<SupportArea[]>(["stress"]);
  const [tone, setTone] = useState<ToneOption>("lugn och mjuk");
  const [reminderTime, setReminderTime] = useState("21:30");
  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [messageLength, setMessageLength] = useState<MessageLength>("kort");
  const [currentGoal, setCurrentGoal] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleArea(area: SupportArea) {
    setAreas((current) =>
      current.includes(area)
        ? current.length === 1
          ? current
          : current.filter((item) => item !== area)
        : [...current, area],
    );
  }

  async function finish() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: displayName.trim() || "Du",
          areas,
          tone,
          reminderTime,
          remindersEnabled,
          messageLength,
          currentGoal: currentGoal.trim() || undefined,
          consentVersion: "2026-07-17",
        }),
      });
      if (!response.ok) throw new Error("Kunde inte spara dina val.");
      router.push("/hem");
      router.refresh();
    } catch {
      setError("Vi kunde inte spara just nu. Försök igen om en stund.");
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-2xl py-8">
      <div className="mb-7 flex items-center justify-between text-sm">
        <span className="font-semibold">Steg {step} av {totalSteps}</span>
        <span className="text-muted">Cirka {Math.max(1, totalSteps - step + 1)} min kvar</span>
      </div>
      <div className="mb-10 h-2 overflow-hidden rounded-full bg-surface-muted" aria-hidden="true">
        <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${(step / totalSteps) * 100}%` }} />
      </div>

      <div className="min-h-[420px]">
        {step === 1 ? (
          <section className="fade-up">
            <p className="text-sm font-semibold text-brand-strong">Först det enkla</p>
            <h1 className="text-balance mt-2 text-4xl font-semibold tracking-[-0.045em]">Vad vill du att Pepply kallar dig?</h1>
            <p className="mt-4 leading-7 text-muted">Du kan använda förnamn, smeknamn eller hoppa över och använda ”du”.</p>
            <div className="mt-8 max-w-md">
              <FormField label="Tilltalsnamn">
                <Input autoFocus value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder="Till exempel Ruben" maxLength={60} />
              </FormField>
            </div>
          </section>
        ) : null}

        {step === 2 ? (
          <section className="fade-up">
            <p className="text-sm font-semibold text-brand-strong">Vad passar dig?</p>
            <h1 className="text-balance mt-2 text-4xl font-semibold tracking-[-0.045em]">Välj områden där du vill ha stöd.</h1>
            <p className="mt-4 leading-7 text-muted">Välj minst ett. Du kan ändra allt senare.</p>
            <div className="mt-8 flex flex-wrap gap-2.5">
              {supportAreas.map((area) => {
                const selected = areas.includes(area);
                return (
                  <button
                    type="button"
                    key={area}
                    onClick={() => toggleArea(area)}
                    aria-pressed={selected}
                    className={cn(
                      "inline-flex min-h-12 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition",
                      selected ? "border-brand bg-brand-soft" : "bg-surface hover:bg-surface-muted",
                    )}
                  >
                    {selected ? <Check aria-hidden="true" size={16} /> : null}
                    <span className="first-letter:uppercase">{area}</span>
                  </button>
                );
              })}
            </div>
          </section>
        ) : null}

        {step === 3 ? (
          <section className="fade-up">
            <p className="text-sm font-semibold text-brand-strong">Hur ska det låta?</p>
            <h1 className="text-balance mt-2 text-4xl font-semibold tracking-[-0.045em]">Välj en ton som känns naturlig.</h1>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {toneOptions.map((option) => (
                <button
                  type="button"
                  key={option}
                  onClick={() => setTone(option)}
                  aria-pressed={tone === option}
                  className={cn(
                    "min-h-16 rounded-2xl border p-4 text-left text-sm font-semibold first-letter:uppercase transition",
                    tone === option ? "border-brand bg-brand-soft" : "bg-surface hover:bg-surface-muted",
                  )}
                >
                  {option}
                </button>
              ))}
            </div>
            <div className="mt-6 flex gap-2 rounded-2xl bg-surface-muted p-1.5">
              {(["kort", "utvecklad"] as MessageLength[]).map((length) => (
                <button
                  type="button"
                  key={length}
                  onClick={() => setMessageLength(length)}
                  className={cn(
                    "min-h-11 flex-1 rounded-xl text-sm font-semibold first-letter:uppercase",
                    messageLength === length ? "bg-surface shadow-sm" : "text-muted",
                  )}
                >
                  {length === "kort" ? "Kort meddelande" : "Något mer utvecklat"}
                </button>
              ))}
            </div>
          </section>
        ) : null}

        {step === 4 ? (
          <section className="fade-up">
            <p className="text-sm font-semibold text-brand-strong">Sista steget</p>
            <h1 className="text-balance mt-2 text-4xl font-semibold tracking-[-0.045em]">När vill du ha din lugna minut?</h1>
            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              <FormField label="Ungefärlig tid">
                <Input type="time" value={reminderTime} onChange={(event) => setReminderTime(event.target.value)} />
              </FormField>
              <FormField label="Påminnelser">
                <button
                  type="button"
                  onClick={() => setRemindersEnabled((value) => !value)}
                  aria-pressed={remindersEnabled}
                  className="flex min-h-12 w-full items-center justify-between rounded-2xl border bg-surface px-4 text-sm font-semibold"
                >
                  {remindersEnabled ? "På" : "Av"}
                  <span className={cn("relative h-6 w-11 rounded-full transition", remindersEnabled ? "bg-brand" : "bg-surface-muted")}>
                    <span className={cn("absolute top-1 size-4 rounded-full bg-white transition", remindersEnabled ? "left-6" : "left-1")} />
                  </span>
                </button>
              </FormField>
            </div>
            <div className="mt-5">
              <FormField label="Har du ett aktuellt mål? (frivilligt)" hint="Pepply hjälper dig göra det litet och realistiskt.">
                <Input value={currentGoal} onChange={(event) => setCurrentGoal(event.target.value)} placeholder="Till exempel plugga 20 minuter" maxLength={180} />
              </FormField>
            </div>
            <div className="mt-7 flex gap-3 rounded-2xl bg-brand-soft p-4 text-sm leading-6">
              <LockKeyhole className="mt-0.5 shrink-0 text-brand-strong" aria-hidden="true" size={19} />
              <p>
                Pepply sparar dina val, mål och betyg för personalisering. Känslig fritext görs inte automatiskt till permanent minne. Du kan se och radera sparad information i Inställningar.
              </p>
            </div>
          </section>
        ) : null}
      </div>

      {error ? <p role="alert" className="mb-4 text-sm text-danger">{error}</p> : null}
      <div className="flex items-center justify-between gap-3 border-t border-border pt-6">
        <Button type="button" variant="ghost" onClick={() => setStep((value) => Math.max(1, value - 1))} disabled={step === 1}>
          <ArrowLeft aria-hidden="true" size={18} /> Tillbaka
        </Button>
        {step < totalSteps ? (
          <Button type="button" onClick={() => setStep((value) => Math.min(totalSteps, value + 1))}>
            Fortsätt <ArrowRight aria-hidden="true" size={18} />
          </Button>
        ) : (
          <Button type="button" onClick={finish} disabled={loading}>
            {loading ? <LoaderCircle className="animate-spin" aria-hidden="true" size={18} /> : <Check aria-hidden="true" size={18} />}
            {loading ? "Sparar…" : "Gör Pepply klart"}
          </Button>
        )}
      </div>
    </div>
  );
}
