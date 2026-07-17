"use client";

import {
  Bookmark,
  Check,
  Flag,
  Heart,
  LoaderCircle,
  MessageCircleHeart,
  Share2,
  ShieldAlert,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { AdBanner } from "@/components/ad-banner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/form-field";
import { SWEDISH_CRISIS_RESOURCES } from "@/lib/safety/resources";

type Result = {
  id: string;
  message: string;
  closing: string;
  source: string;
  safetyLevel: "none" | "concern" | "urgent";
};

const moods = ["Tung", "Trött", "Stressad", "Okej", "Lugn", "Blandad"];

function todayKey() {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Stockholm" }).format(new Date());
}

export function RitualFlow() {
  const [mood, setMood] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [stage, setStage] = useState<"checkin" | "loading" | "result">("checkin");
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [feedback, setFeedback] = useState<boolean | null>(null);
  const [shared, setShared] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reported, setReported] = useState(false);

  async function generate() {
    if (!mood) return;
    setStage("loading");
    setError(null);
    try {
      const response = await fetch("/api/rituals/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mood,
          note: note.trim() || undefined,
          question: "Vad tog mest energi i dag?",
          tone: "lugn och mjuk",
          length: "kort",
          areas: ["studier", "träning", "självkänsla"],
          activeGoal: "Plugga matte 20 minuter",
          recentMessages: [],
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Kunde inte skapa meddelandet.");
      setResult(payload);
      setStage("result");
      localStorage.setItem("pepply-last-ritual-date", todayKey());
      localStorage.setItem("pepply-last-message", payload.message);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Något gick fel.");
      setStage("checkin");
    }
  }

  async function rate(helpful: boolean) {
    setFeedback(helpful);
    if (!result) return;
    await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messageId: result.id, helpful }),
    }).catch(() => undefined);
  }

  async function save() {
    if (!result) return;
    const existing = JSON.parse(localStorage.getItem("pepply-saved-messages") ?? "[]") as string[];
    localStorage.setItem("pepply-saved-messages", JSON.stringify([...new Set([result.message, ...existing])].slice(0, 50)));
    setSaved(true);
    await fetch("/api/saved", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messageId: result.id }),
    }).catch(() => undefined);
  }

  async function share() {
    if (!result) return;
    const text = `${result.message}\n\n— Pepply`;
    if (navigator.share) {
      await navigator.share({ title: "Mitt Pepply-meddelande", text }).catch(() => undefined);
    } else {
      await navigator.clipboard.writeText(text);
    }
    setShared(true);
  }

  async function report(reason: string) {
    if (!result) return;
    const response = await fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        targetType: "generated_message",
        targetId: result.id,
        reason,
      }),
    });
    if (response.ok) {
      setReported(true);
      setReportOpen(false);
    }
  }

  if (stage === "loading") {
    return (
      <div className="fade-in grid min-h-[70dvh] place-items-center text-center" aria-live="polite">
        <div>
          <span className="mx-auto grid size-16 place-items-center rounded-3xl bg-brand-soft text-brand-strong">
            <LoaderCircle aria-hidden="true" className="animate-spin" size={27} />
          </span>
          <h1 className="mt-7 text-3xl font-semibold tracking-tight">En liten stund.</h1>
          <p className="mt-3 text-muted">Pepply formulerar ett enda meddelande utifrån din kväll.</p>
        </div>
      </div>
    );
  }

  if (stage === "result" && result) {
    const crisis = result.safetyLevel !== "none";
    return (
      <div className="fade-up mx-auto flex min-h-[78dvh] max-w-2xl flex-col justify-center py-10">
        <div className="text-center">
          <span className={`mx-auto grid size-14 place-items-center rounded-2xl ${crisis ? "bg-red-50 text-danger dark:bg-red-950/30" : "bg-brand-soft text-brand-strong"}`}>
            {crisis ? <ShieldAlert aria-hidden="true" size={25} /> : <MessageCircleHeart aria-hidden="true" size={25} />}
          </span>
          <p className={`mt-6 text-sm font-semibold ${crisis ? "text-danger" : "text-brand-strong"}`}>
            {crisis ? "Viktigt just nu" : "Ditt meddelande i kväll"}
          </p>
        </div>

        <blockquote className="text-balance mt-5 text-center text-2xl font-medium leading-[1.55] tracking-[-0.025em] sm:text-3xl">
          {result.message}
        </blockquote>

        {crisis ? (
          <div className="mt-8 space-y-3" aria-label="Stöd och akutresurser">
            {SWEDISH_CRISIS_RESOURCES.map((resource) => (
              <a
                key={resource.label}
                href={resource.href}
                target={resource.href.startsWith("http") ? "_blank" : undefined}
                rel={resource.href.startsWith("http") ? "noreferrer" : undefined}
                className="block rounded-2xl border border-border bg-surface p-4 transition hover:bg-surface-muted"
              >
                <span className="text-xs font-semibold uppercase tracking-wider text-muted">{resource.label}</span>
                <span className="mt-1 block font-semibold">{resource.value}</span>
                <span className="mt-1 block text-sm leading-6 text-muted">{resource.description}</span>
              </a>
            ))}
          </div>
        ) : (
          <>
            <div className="mt-9 flex flex-wrap justify-center gap-2">
              <Button variant="secondary" className="min-h-11" onClick={save}>
                {saved ? <Check aria-hidden="true" size={17} /> : <Bookmark aria-hidden="true" size={17} />}
                {saved ? "Sparat" : "Spara"}
              </Button>
              <Button variant="secondary" className="min-h-11" onClick={share}>
                {shared ? <Check aria-hidden="true" size={17} /> : <Share2 aria-hidden="true" size={17} />}
                {shared ? "Klart" : "Dela"}
              </Button>
              <Button variant="ghost" className="min-h-11 text-muted" onClick={() => setReportOpen((value) => !value)}>
                {reported ? <Check aria-hidden="true" size={17} /> : <Flag aria-hidden="true" size={17} />}
                {reported ? "Rapporterat" : "Rapportera"}
              </Button>
            </div>
            {reportOpen && !reported ? (
              <div className="mt-4 rounded-2xl border border-border bg-surface p-4 text-center">
                <p className="text-sm font-semibold">Vad kändes fel?</p>
                <div className="mt-3 flex flex-wrap justify-center gap-2">
                  {["Olämpligt innehåll", "Kändes inte relevant", "Säkerhetsproblem"].map((reason) => (
                    <button key={reason} type="button" onClick={() => report(reason)} className="min-h-10 rounded-full bg-surface-muted px-4 text-sm font-semibold">
                      {reason}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
            <div className="mt-7 text-center">
              <p className="text-sm text-muted">Hjälpte detta?</p>
              <div className="mt-2 flex justify-center gap-2">
                <button
                  type="button"
                  onClick={() => rate(true)}
                  aria-label="Ja, meddelandet hjälpte"
                  aria-pressed={feedback === true}
                  className={`grid size-11 place-items-center rounded-full border ${feedback === true ? "border-success bg-[#e5f2e8] text-success dark:bg-[#203a27]" : "bg-surface"}`}
                >
                  <ThumbsUp aria-hidden="true" size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => rate(false)}
                  aria-label="Nej, meddelandet hjälpte inte"
                  aria-pressed={feedback === false}
                  className={`grid size-11 place-items-center rounded-full border ${feedback === false ? "border-danger bg-red-50 text-danger dark:bg-red-950/30" : "bg-surface"}`}
                >
                  <ThumbsDown aria-hidden="true" size={18} />
                </button>
              </div>
            </div>
            <AdBanner />
          </>
        )}

        <div className="mt-10 border-t border-border pt-8 text-center">
          <Heart aria-hidden="true" className="mx-auto text-brand-strong" size={20} />
          <p className="mt-3 font-semibold">{result.closing}</p>
          <Link href="/hem" className="mt-5 inline-flex min-h-11 items-center rounded-full px-5 text-sm font-semibold text-muted hover:bg-surface-muted hover:text-foreground">
            Stäng för i kväll
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-up mx-auto flex min-h-[78dvh] max-w-2xl flex-col justify-center py-10">
      <p className="text-center text-sm font-semibold text-brand-strong">Din minut i kväll</p>
      <h1 className="text-balance mt-3 text-center text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
        Vad tog mest energi i dag?
      </h1>
      <p className="mt-3 text-center leading-7 text-muted">Välj det som ligger närmast. Det behöver inte vara exakt.</p>

      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {moods.map((option) => (
          <button
            type="button"
            key={option}
            onClick={() => setMood(option)}
            aria-pressed={mood === option}
            className={`min-h-14 rounded-2xl border px-4 text-sm font-semibold transition ${mood === option ? "border-brand bg-brand-soft" : "bg-surface hover:bg-surface-muted"}`}
          >
            {option}
          </button>
        ))}
      </div>

      <div className="mt-6">
        <label className="mb-2 block text-sm font-semibold" htmlFor="ritual-note">
          Vill du lägga till några ord? <span className="font-normal text-muted">Frivilligt</span>
        </label>
        <Textarea
          id="ritual-note"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          rows={3}
          maxLength={600}
          placeholder="Till exempel: Jag försökte men koncentrationen tog slut."
        />
        <div className="mt-2 flex justify-between text-xs text-muted">
          <span>Sparas inte som permanent profilminne.</span>
          <span>{note.length}/600</span>
        </div>
      </div>

      {error ? <p role="alert" className="mt-5 rounded-2xl bg-red-50 p-4 text-sm text-danger dark:bg-red-950/30">{error}</p> : null}

      <Button type="button" className="mt-7 w-full sm:mx-auto sm:w-auto sm:min-w-56" onClick={generate} disabled={!mood}>
        Visa mitt meddelande
      </Button>
      <p className="mt-4 text-center text-xs leading-5 text-muted">Pepply är inte vård eller en akuttjänst. Säkerhetsflödet tar över vid tydliga risktecken.</p>
    </div>
  );
}
