"use client";

import { Bookmark, Check, Heart, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/form-field";
import { professionalMessages } from "@/lib/demo-data";

type LibraryMessage = (typeof professionalMessages)[number] & {
  source: "professional" | "community";
};

const initialMessages: LibraryMessage[] = professionalMessages.map((message) => ({
  ...message,
  source: "professional",
}));

export function ExploreLibrary() {
  const [messages, setMessages] = useState<LibraryMessage[]>(initialMessages);
  const [category, setCategory] = useState("alla");
  const [query, setQuery] = useState("");
  const [saved, setSaved] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    Promise.all([fetch("/api/library"), fetch("/api/saved")])
      .then(async ([libraryResponse, savedResponse]) => {
        if (!libraryResponse.ok || !savedResponse.ok) {
          throw new Error("library_load_failed");
        }
        const libraryPayload = (await libraryResponse.json()) as {
          messages: LibraryMessage[];
        };
        const savedPayload = (await savedResponse.json()) as {
          saved: Array<{ messageId: string }>;
        };
        if (active) {
          const localSaved = JSON.parse(
            localStorage.getItem("pepply-saved-messages") ?? "[]",
          ) as string[];
          setMessages(libraryPayload.messages);
          setSaved([
            ...new Set([
              ...savedPayload.saved.map((item) => item.messageId),
              ...libraryPayload.messages
                .filter((message) => localSaved.includes(message.text))
                .map((message) => message.id),
            ]),
          ]);
        }
      })
      .catch(() => {
        if (active) setError("Biblioteket kunde inte uppdateras just nu.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const categories = useMemo(
    () => ["alla", ...new Set(messages.map((item) => item.category))],
    [messages],
  );
  const visible = useMemo(
    () =>
      messages.filter(
        (message) =>
          (category === "alla" || message.category === category) &&
          `${message.title} ${message.text}`
            .toLowerCase()
            .includes(query.toLowerCase()),
      ),
    [category, messages, query],
  );

  async function save(message: LibraryMessage) {
    const wasSaved = saved.includes(message.id);
    setSaved((current) =>
      wasSaved
        ? current.filter((item) => item !== message.id)
        : [...current, message.id],
    );

    const localMessages = JSON.parse(
      localStorage.getItem("pepply-saved-messages") ?? "[]",
    ) as string[];
    const nextLocal = wasSaved
      ? localMessages.filter((item) => item !== message.text)
      : [...new Set([message.text, ...localMessages])].slice(0, 50);
    localStorage.setItem("pepply-saved-messages", JSON.stringify(nextLocal));

    try {
      const response = await fetch("/api/saved", {
        method: wasSaved ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messageId: message.id,
          source: message.source,
        }),
      });
      if (!response.ok) throw new Error("save_failed");
    } catch {
      localStorage.setItem(
        "pepply-saved-messages",
        JSON.stringify(localMessages),
      );
      setSaved((current) =>
        wasSaved
          ? [...current, message.id]
          : current.filter((item) => item !== message.id),
      );
      setError("Meddelandet kunde inte sparas. Försök igen.");
    }
  }

  return (
    <div>
      {error ? (
        <p role="status" className="mb-4 rounded-2xl bg-brand-soft p-4 text-sm">
          {error}
        </p>
      ) : null}
      <div className="flex flex-col gap-4 rounded-[1.5rem] border border-border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute left-4 top-3.5 text-muted" aria-hidden="true" size={18} />
          <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Sök i det lilla biblioteket" className="pl-11" />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0" aria-label="Filtrera på kategori">
          {categories.map((item) => (
            <button
              type="button"
              key={item}
              onClick={() => setCategory(item)}
              aria-pressed={category === item}
              className={`min-h-10 shrink-0 rounded-full px-4 text-sm font-semibold first-letter:uppercase ${category === item ? "bg-foreground text-background" : "bg-surface-muted text-muted"}`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {loading ? <p role="status" className="mt-5 text-sm text-muted">Uppdaterar biblioteket…</p> : null}
      {visible.length ? (
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {visible.map((message) => (
            <Card key={message.id} className="flex min-h-64 flex-col">
              <div className="flex items-center justify-between gap-3">
                <Badge className="first-letter:uppercase">{message.category}</Badge>
                <button type="button" onClick={() => save(message)} aria-label={saved.includes(message.id) ? "Ta bort från sparade" : "Spara meddelande"} className="grid size-10 place-items-center rounded-full hover:bg-surface-muted">
                  {saved.includes(message.id) ? <Check aria-hidden="true" size={18} className="text-success" /> : <Bookmark aria-hidden="true" size={18} className="text-muted" />}
                </button>
              </div>
              <h2 className="mt-5 text-lg font-semibold">{message.title}</h2>
              <blockquote className="mt-4 flex-1 text-lg leading-8">“{message.text}”</blockquote>
              <p className="mt-6 flex items-center gap-2 text-xs text-muted"><Heart aria-hidden="true" size={14} /> {message.author} · Granskat innehåll</p>
            </Card>
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-[1.75rem] border border-dashed border-border py-20 text-center">
          <Search className="mx-auto text-muted" aria-hidden="true" size={24} />
          <h2 className="mt-4 font-semibold">Inget hittades.</h2>
          <p className="mt-1 text-sm text-muted">Prova ett annat ord eller visa alla kategorier.</p>
        </div>
      )}

      <p className="mt-7 text-center text-sm text-muted">Du har nått slutet. Biblioteket är medvetet begränsat.</p>
    </div>
  );
}
