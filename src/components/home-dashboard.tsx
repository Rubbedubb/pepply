"use client";

import { ArrowRight, Check, ChevronRight, Flame, Goal, MoonStar, Sparkles } from "lucide-react";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { HomeData } from "@/lib/app-data";
import { useLocalStorageValue } from "@/lib/use-local-storage";

function todayKey() {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Stockholm",
  }).format(new Date());
}

export function HomeDashboard({ data }: { data: HomeData }) {
  const completed = useLocalStorageValue("pepply-last-ritual-date") === todayKey();

  return (
    <div className="fade-in">
      <header className="mb-7 sm:mb-10">
        <p className="text-sm font-semibold text-brand-strong">God kväll, {data.displayName}</p>
        <h1 className="text-balance mt-2 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
          {completed ? "Du är klar för i kväll." : "En minut. Sedan får dagen vara färdig."}
        </h1>
      </header>

      {completed ? (
        <Card className="ritual-glow shadow-soft overflow-hidden border-brand/30 px-5 py-10 text-center sm:px-10 sm:py-14">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-[#e5f2e8] text-success dark:bg-[#203a27]">
            <Check aria-hidden="true" size={25} strokeWidth={2.5} />
          </span>
          <p className="mt-6 text-sm font-semibold text-success">Kvällsritual genomförd</p>
          <h2 className="text-balance mx-auto mt-3 max-w-xl text-3xl font-semibold tracking-tight">
            Det räcker för i kväll. Ta hand om dig.
          </h2>
          <p className="mx-auto mt-4 max-w-lg leading-7 text-muted">
            Det finns inget mer du behöver göra här nu. Ditt meddelande finns sparat i historiken om du vill återvända en annan dag.
          </p>
          <Link href="/historik" className="mt-7 inline-flex items-center gap-2 text-sm font-semibold underline decoration-border underline-offset-4">
            Se kvällens meddelande <ChevronRight aria-hidden="true" size={16} />
          </Link>
        </Card>
      ) : (
        <Card className="ritual-glow shadow-soft overflow-hidden border-brand/30 p-0">
          <div className="grid gap-7 px-5 py-8 sm:px-9 sm:py-10 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <span className="grid size-12 place-items-center rounded-2xl bg-brand-soft text-brand-strong">
                <MoonStar aria-hidden="true" size={22} />
              </span>
              <p className="mt-6 text-sm font-semibold text-brand-strong">Din minut i kväll</p>
              <h2 className="text-balance mt-2 max-w-2xl text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
                Vad tog mest energi i dag?
              </h2>
              <p className="mt-3 max-w-xl leading-7 text-muted">
                Ett tryck eller några egna ord räcker. Du får ett enda personligt meddelande.
              </p>
            </div>
            <ButtonLink href="/ritual" className="w-full px-7 md:w-auto">
              Börja min minut <ArrowRight aria-hidden="true" size={18} />
            </ButtonLink>
          </div>
        </Card>
      )}

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <Card>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-muted">Aktuellt mål</p>
              <h2 className="mt-1 text-lg font-semibold">{data.activeGoal?.title ?? "Inget aktivt mål ännu"}</h2>
            </div>
            <span className="grid size-10 place-items-center rounded-2xl bg-brand-soft text-brand-strong">
              <Goal aria-hidden="true" size={19} />
            </span>
          </div>
          <div className="mt-6 h-2 overflow-hidden rounded-full bg-surface-muted">
            <div
              className="h-full rounded-full bg-brand"
              style={{
                width: `${data.activeGoal?.totalSteps ? Math.round((data.activeGoal.completedSteps / data.activeGoal.totalSteps) * 100) : 0}%`,
              }}
            />
          </div>
          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="text-muted">
              {data.activeGoal
                ? `${data.activeGoal.completedSteps} av ${data.activeGoal.totalSteps} små steg`
                : "Börja så litet du vill"}
            </span>
            <Link href="/mal" className="font-semibold">Öppna mål</Link>
          </div>
        </Card>

        <Card>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-muted">Din rytm</p>
              <h2 className="mt-1 text-lg font-semibold">
                {data.streaksEnabled
                  ? `${data.streakCount} kvällar där du kom tillbaka`
                  : "Din rytm är privat"}
              </h2>
            </div>
            <span className="grid size-10 place-items-center rounded-2xl bg-surface-muted text-brand-strong">
              <Flame aria-hidden="true" size={19} />
            </span>
          </div>
          <div className="mt-6 flex gap-2" aria-label="Fem av sju senaste dagar genomförda">
            {data.week.map((done, index) => (
              <span key={index} className={`h-9 flex-1 rounded-xl ${done ? "bg-brand-soft" : "bg-surface-muted"}`}>
                <span className="sr-only">{done ? "Genomförd" : "Inte genomförd"}</span>
              </span>
            ))}
          </div>
          <p className="mt-3 text-sm leading-6 text-muted">En missad kväll raderar ingenting. Det viktiga är att kunna komma tillbaka.</p>
        </Card>
      </div>

      <div className="mt-6 rounded-[1.5rem] border border-dashed border-border px-5 py-4 text-sm text-muted sm:flex sm:items-center sm:justify-between">
        <p className="flex items-center gap-2"><Sparkles aria-hidden="true" size={17} className="text-brand-strong" /> Din påminnelse är satt till {data.reminderTime}.</p>
        <Link href="/installningar" className="mt-2 inline-flex font-semibold text-foreground sm:mt-0">Justera</Link>
      </div>
    </div>
  );
}
