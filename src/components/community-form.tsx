"use client";

import { Check, ChevronDown, LoaderCircle, Send } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FormField, Textarea } from "@/components/ui/form-field";
import { supportAreas, type SupportArea } from "@/lib/types";

export function CommunityForm({ displayName }: { displayName: string }) {
  const [text, setText] = useState("");
  const [category, setCategory] = useState<SupportArea>("vardagsmotivation");
  const [attribution, setAttribution] = useState<"anonymous" | "display_name">("anonymous");
  const [rightsConfirmed, setRightsConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, category, attribution, rightsConfirmed }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Kunde inte skicka bidraget.");
      setSubmitted(true);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Något gick fel.");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="rounded-[1.75rem] border border-success/30 bg-[#eef7f0] p-8 text-center dark:bg-[#203a27] sm:p-12">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-white text-success dark:bg-[#172b1d]">
          <Check aria-hidden="true" size={24} />
        </span>
        <h2 className="mt-6 text-2xl font-semibold">Tack. Nu granskas texten.</h2>
        <p className="mx-auto mt-3 max-w-lg leading-7 text-muted">
          Inget bidrag publiceras automatiskt. Du får en notis när en moderator har fattat beslut.
        </p>
        <Button type="button" variant="secondary" className="mt-6" onClick={() => { setSubmitted(false); setText(""); setRightsConfirmed(false); }}>
          Skriv ett till
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-[1.75rem] border border-border bg-surface p-5 sm:p-7">
      <FormField label="Ditt peppmeddelande" hint="20–500 tecken. Skriv med egna ord och undvik löften om att allt kommer bli bra.">
        <Textarea value={text} onChange={(event) => setText(event.target.value)} rows={6} minLength={20} maxLength={500} required placeholder="Skriv något du själv hade behövt höra efter en tung dag…" />
      </FormField>
      <div className="mt-2 text-right text-xs text-muted">{text.length}/500</div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <FormField label="Kategori">
          <div className="relative">
            <select value={category} onChange={(event) => setCategory(event.target.value as SupportArea)} className="min-h-12 w-full appearance-none rounded-2xl border border-border bg-surface px-4 pr-10 text-sm">
              {supportAreas.map((area) => <option key={area} value={area}>{area}</option>)}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-3.5 text-muted" aria-hidden="true" size={18} />
          </div>
        </FormField>
        <FormField label="Publicera som">
          <div className="flex min-h-12 rounded-2xl bg-surface-muted p-1">
            <button type="button" onClick={() => setAttribution("anonymous")} className={`flex-1 rounded-xl text-sm font-semibold ${attribution === "anonymous" ? "bg-surface shadow-sm" : "text-muted"}`}>Anonym</button>
            <button type="button" onClick={() => setAttribution("display_name")} className={`flex-1 rounded-xl text-sm font-semibold ${attribution === "display_name" ? "bg-surface shadow-sm" : "text-muted"}`}>{displayName}</button>
          </div>
        </FormField>
      </div>

      <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-2xl bg-surface-muted p-4 text-sm leading-6">
        <input type="checkbox" checked={rightsConfirmed} onChange={(event) => setRightsConfirmed(event.target.checked)} className="mt-1 size-4 accent-[var(--brand)]" required />
        <span>Jag bekräftar att jag har skrivit texten själv eller har rätt att publicera den, och att den inte innehåller personuppgifter om någon annan.</span>
      </label>

      {error ? <p role="alert" className="mt-5 text-sm text-danger">{error}</p> : null}
      <Button type="submit" className="mt-6 w-full sm:w-auto" disabled={loading || text.trim().length < 20 || !rightsConfirmed}>
        {loading ? <LoaderCircle className="animate-spin" aria-hidden="true" size={18} /> : <Send aria-hidden="true" size={18} />}
        {loading ? "Skickar…" : "Skicka för granskning"}
      </Button>
    </form>
  );
}
