"use client";

import { ArrowUp, LoaderCircle, ShieldAlert, Sparkles, UserRound } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/form-field";
import { SWEDISH_CRISIS_RESOURCES } from "@/lib/safety/resources";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  safetyLevel?: "none" | "concern" | "urgent";
};

const starters = [
  "Hjälp mig sortera dagen",
  "Gör mitt mål mindre",
  "Jag fastnar i en tanke",
];

export function ChatClient() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Vad vill du reda ut en liten bit av? Vi behöver inte lösa allt.",
      safetyLevel: "none",
    },
  ]);
  const [input, setInput] = useState("");
  const [conversationId, setConversationId] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [suggestEnding, setSuggestEnding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const turnCount = messages.filter((message) => message.role === "user").length;
  const reachedLimit = turnCount >= 8;

  async function send(text = input) {
    const trimmed = text.trim();
    if (!trimmed || loading || reachedLimit) return;

    setMessages((current) => [
      ...current,
      { id: crypto.randomUUID(), role: "user", content: trimmed },
    ]);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, conversationId, turnCount }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Kunde inte svara just nu.");

      setConversationId(payload.conversationId);
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: payload.message,
          safetyLevel: payload.safetyLevel,
        },
      ]);
      setSuggestEnding(payload.suggestEnding);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Något gick fel.");
    } finally {
      setLoading(false);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }

  return (
    <div className="grid min-h-[calc(100dvh-12rem)] grid-rows-[1fr_auto] overflow-hidden rounded-[1.75rem] border border-border bg-surface shadow-soft">
      <div className="overflow-y-auto px-4 py-6 sm:px-8" aria-live="polite">
        <div className="mx-auto max-w-2xl space-y-5">
          {messages.map((message) => {
            const crisis = message.safetyLevel && message.safetyLevel !== "none";
            return (
              <div key={message.id} className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                {message.role === "assistant" ? (
                  <span className={`mt-1 grid size-9 shrink-0 place-items-center rounded-2xl ${crisis ? "bg-red-50 text-danger dark:bg-red-950/30" : "bg-brand-soft text-brand-strong"}`}>
                    {crisis ? <ShieldAlert aria-hidden="true" size={17} /> : <Sparkles aria-hidden="true" size={17} />}
                  </span>
                ) : null}
                <div className={`max-w-[85%] rounded-[1.4rem] px-4 py-3 text-sm leading-7 sm:text-base ${message.role === "user" ? "rounded-br-md bg-foreground text-background" : crisis ? "rounded-bl-md border border-danger/30 bg-red-50 dark:bg-red-950/20" : "rounded-bl-md bg-surface-muted"}`}>
                  <p>{message.content}</p>
                  {crisis ? (
                    <div className="mt-4 space-y-2 border-t border-danger/20 pt-4 text-sm">
                      {SWEDISH_CRISIS_RESOURCES.slice(0, 3).map((resource) => (
                        <a key={resource.label} href={resource.href} className="block font-semibold underline underline-offset-3" target={resource.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
                          {resource.label}: {resource.value}
                        </a>
                      ))}
                    </div>
                  ) : null}
                </div>
                {message.role === "user" ? (
                  <span className="mt-1 grid size-9 shrink-0 place-items-center rounded-2xl bg-surface-muted text-muted">
                    <UserRound aria-hidden="true" size={17} />
                  </span>
                ) : null}
              </div>
            );
          })}

          {loading ? (
            <div className="flex items-center gap-3 text-sm text-muted">
              <span className="grid size-9 place-items-center rounded-2xl bg-brand-soft text-brand-strong">
                <LoaderCircle aria-hidden="true" className="animate-spin" size={17} />
              </span>
              Pepply tänker kort…
            </div>
          ) : null}

          {suggestEnding || reachedLimit ? (
            <div className="rounded-2xl border border-brand/30 bg-brand-soft p-4 text-sm leading-6">
              <p className="font-semibold">Det kan räcka här för stunden.</p>
              <p className="mt-1 text-muted">
                {reachedLimit
                  ? "Chatten är pausad efter åtta svar. Spara gärna ett litet nästa steg och återvänd senare om du vill."
                  : "Vill du sammanfatta ett litet nästa steg, eller avsluta utan att göra mer?"}
              </p>
            </div>
          ) : null}

          {messages.length === 1 ? (
            <div className="flex flex-wrap gap-2 pt-1">
              {starters.map((starter) => (
                <button key={starter} type="button" onClick={() => send(starter)} className="min-h-10 rounded-full border border-border bg-surface px-4 text-sm font-semibold hover:bg-surface-muted">
                  {starter}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <div className="border-t border-border bg-surface px-4 py-4 sm:px-8">
        <div className="mx-auto max-w-2xl">
          {error ? <p role="alert" className="mb-3 text-sm text-danger">{error}</p> : null}
          <div className="flex items-end gap-2 rounded-[1.4rem] border border-border bg-background p-2">
            <Textarea
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  send();
                }
              }}
              rows={1}
              maxLength={1200}
              disabled={loading || reachedLimit}
              placeholder={reachedLimit ? "Chatten är färdig för stunden" : "Skriv kort vad som tar plats…"}
              className="min-h-11 flex-1 border-0 bg-transparent py-2.5 focus:outline-none"
            />
            <Button type="button" onClick={() => send()} disabled={!input.trim() || loading || reachedLimit} aria-label="Skicka" className="size-11 min-h-11 shrink-0 px-0">
              <ArrowUp aria-hidden="true" size={18} />
            </Button>
          </div>
          <p className="mt-2 text-center text-[0.7rem] leading-5 text-muted">AI kan ha fel. Pepply är inte vård och sparar inte chattfritext som permanent profilminne.</p>
        </div>
      </div>
    </div>
  );
}
