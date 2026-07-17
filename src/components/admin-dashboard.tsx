"use client";

import { BadgeCheck, BarChart3, Bot, Check, CircleDollarSign, Flag, LoaderCircle, Megaphone, ShieldCheck, Sparkles, Users, X } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export type QueueItem = {
  id: string;
  text: string;
  category: string;
  author: string;
  flags: string[];
};

const demoQueue: QueueItem[] = [
  {
    id: "10000000-0000-4000-8000-000000000001",
    text: "Du behöver inte vinna över dagen. Ibland räcker det att låta den sluta utan att döma allt du gjorde.",
    category: "självkänsla",
    author: "Anonym",
    flags: [],
  },
  {
    id: "10000000-0000-4000-8000-000000000002",
    text: "I morgon kommer säkert allt kännas bättre, jag lovar.",
    category: "vardagsmotivation",
    author: "Elin",
    flags: ["olämpligt löfte"],
  },
];

export function AdminDashboard({
  initialItems = demoQueue,
  loadError = false,
}: {
  initialItems?: QueueItem[];
  loadError?: boolean;
}) {
  const [queue, setQueue] = useState(initialItems);
  const [working, setWorking] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(
    loadError ? "Modereringskön kunde inte hämtas. Försök igen senare." : null,
  );

  async function decide(id: string, decision: "approved" | "rejected") {
    setWorking(id);
    const response = await fetch(`/api/admin/moderation/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        decision,
        reason: decision === "rejected" ? "Olämpligt eller tvärsäkert löfte." : undefined,
      }),
    });
    setWorking(null);
    if (response.ok) {
      setQueue((current) => current.filter((item) => item.id !== id));
      setNotice(decision === "approved" ? "Bidraget godkändes och åtgärden loggades." : "Bidraget avslogs och åtgärden loggades.");
    } else {
      setNotice("Åtgärden kunde inte genomföras.");
    }
  }

  return (
    <div className="space-y-6">
      {notice ? <p role="status" className="rounded-2xl bg-brand-soft p-4 text-sm">{notice}</p> : null}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Aktiva användare, 7 d", value: "1 284", delta: "+8%", icon: Users },
          { label: "Slutförda ritualer", value: "72%", delta: "+3 p.p.", icon: BadgeCheck },
          { label: "Hjälpsamma svar", value: "84%", delta: "stabilt", icon: Sparkles },
          { label: "AI-kostnad / aktiv", value: "0,42 kr", delta: "−6%", icon: CircleDollarSign },
        ].map(({ label, value, delta, icon: Icon }) => (
          <Card key={label}>
            <div className="flex items-start justify-between"><Icon aria-hidden="true" size={19} className="text-brand-strong" /><span className="text-xs font-semibold text-success">{delta}</span></div>
            <p className="mt-5 text-2xl font-semibold tracking-tight">{value}</p>
            <p className="mt-1 text-xs leading-5 text-muted">{label}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <Card>
          <div className="flex items-start justify-between gap-4">
            <div><p className="text-xs font-bold uppercase tracking-wider text-brand-strong">Modereringskö</p><h2 className="mt-2 text-xl font-semibold">{queue.length} bidrag väntar</h2></div>
            <Badge>{queue.length} öppna</Badge>
          </div>
          <div className="mt-6 space-y-4">
            {queue.map((item) => (
              <article key={item.id} className="rounded-2xl border border-border p-4">
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted"><span className="font-semibold text-foreground">{item.author}</span><span>·</span><span className="first-letter:uppercase">{item.category}</span>{item.flags.map((flag) => <Badge key={flag} className="bg-red-50 text-danger dark:bg-red-950/30">{flag}</Badge>)}</div>
                <p className="mt-3 text-sm leading-7">{item.text}</p>
                <div className="mt-4 flex gap-2">
                  <Button type="button" variant="secondary" className="min-h-10 px-4" onClick={() => decide(item.id, "rejected")} disabled={working === item.id}>{working === item.id ? <LoaderCircle className="animate-spin" aria-hidden="true" size={16} /> : <X aria-hidden="true" size={16} />}Avslå</Button>
                  <Button type="button" className="min-h-10 px-4" onClick={() => decide(item.id, "approved")} disabled={working === item.id}><Check aria-hidden="true" size={16} />Godkänn</Button>
                </div>
              </article>
            ))}
            {!queue.length ? <div className="py-10 text-center"><Check className="mx-auto text-success" aria-hidden="true" /><p className="mt-3 font-semibold">Kön är tom.</p></div> : null}
          </div>
        </Card>

        <div className="space-y-5">
          <Card>
            <div className="flex items-center justify-between"><div className="flex items-center gap-2"><ShieldCheck aria-hidden="true" size={19} className="text-success" /><h2 className="font-semibold">Säkerhet, 24 h</h2></div><Badge className="bg-[#e5f2e8] text-success dark:bg-[#203a27]">Normal</Badge></div>
            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between"><dt className="text-muted">Säkerhetsflöden</dt><dd className="font-semibold">7</dd></div>
              <div className="flex justify-between"><dt className="text-muted">Manuell granskning</dt><dd className="font-semibold">2</dd></div>
              <div className="flex justify-between"><dt className="text-muted">Felaktiga AI-svar</dt><dd className="font-semibold">0</dd></div>
            </dl>
            <p className="mt-4 text-xs leading-5 text-muted">Granskare ser minsta nödvändiga utdrag. Streaks och annonsdata visas aldrig i säkerhetsärenden.</p>
          </Card>

          <Card>
            <div className="flex items-center gap-2"><Bot aria-hidden="true" size={19} className="text-brand-strong" /><h2 className="font-semibold">Aktiv AI-konfiguration</h2></div>
            <dl className="mt-5 space-y-3 text-sm"><div className="flex justify-between gap-3"><dt className="text-muted">Ritualprompt</dt><dd className="font-mono text-xs">ritual-sv-v1.1.0</dd></div><div className="flex justify-between gap-3"><dt className="text-muted">Reservflöde</dt><dd className="font-semibold text-success">Aktivt</dd></div><div className="flex justify-between gap-3"><dt className="text-muted">Kostnadsgräns</dt><dd className="font-semibold">5 / dag</dd></div></dl>
          </Card>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { icon: Megaphone, title: "Annonser", value: "3 aktiva", text: "1 924 visningar · 41 klick" },
          { icon: Flag, title: "Rapporter", value: "4 öppna", text: "Äldsta är 3 timmar" },
          { icon: BarChart3, title: "Premium", value: "19 kr/mån", text: "4,8% konvertering" },
        ].map(({ icon: Icon, title, value, text }) => <Card key={title}><Icon aria-hidden="true" size={19} className="text-brand-strong" /><p className="mt-4 text-sm text-muted">{title}</p><p className="mt-1 text-lg font-semibold">{value}</p><p className="mt-2 text-xs text-muted">{text}</p></Card>)}
      </div>
    </div>
  );
}
