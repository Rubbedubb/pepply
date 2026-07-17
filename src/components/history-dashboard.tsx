"use client";

import { Bookmark, CalendarDays, Check, Goal, Heart, TrendingUp } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { weeklyHistory } from "@/lib/demo-data";
import { useLocalStorageValue } from "@/lib/use-local-storage";

const fallbackMessage =
  "Du får vara trött utan att göra tröttheten till ett bevis på att du är svag. Det som återstår kan vänta.";

interface HistorySnapshot {
  stats: {
    ritualCount: number;
    completedLastSevenDays: number;
    helpfulPercent: number | null;
    completedGoalSteps: number;
    totalGoalSteps: number;
  };
  week: Array<{ day: string; completed: boolean; mood: string | null }>;
  latestMessage: { text: string; createdAt: string } | null;
  saved: Array<{ id: string; text: string; createdAt: string }>;
}

const initialSnapshot: HistorySnapshot = {
  stats: {
    ritualCount: 18,
    completedLastSevenDays: 5,
    helpfulPercent: 82,
    completedGoalSteps: 3,
    totalGoalSteps: 5,
  },
  week: weeklyHistory,
  latestMessage: null,
  saved: [],
};

export function HistoryDashboard() {
  const localLastMessage = useLocalStorageValue("pepply-last-message");
  const savedRaw = useLocalStorageValue("pepply-saved-messages");
  const [snapshot, setSnapshot] = useState(initialSnapshot);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/account/history")
      .then(async (response) => {
        if (!response.ok) throw new Error("history_load_failed");
        return (await response.json()) as HistorySnapshot;
      })
      .then((payload) => {
        if (active) setSnapshot(payload);
      })
      .catch(() => {
        if (active) setError("Historiken kunde inte uppdateras just nu.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const localSaved = useMemo(() => {
    try {
      return JSON.parse(savedRaw ?? "[]") as string[];
    } catch {
      return [];
    }
  }, [savedRaw]);
  const savedMessages = useMemo(
    () =>
      [...new Set([...snapshot.saved.map((item) => item.text), ...localSaved])].filter(
        Boolean,
      ),
    [localSaved, snapshot.saved],
  );
  const lastMessage =
    snapshot.latestMessage?.text ?? localLastMessage ?? fallbackMessage;

  return (
    <div>
      {error ? (
        <p role="status" className="mb-5 rounded-2xl bg-brand-soft p-4 text-sm">
          {error}
        </p>
      ) : null}
      {loading ? <p role="status" className="mb-4 text-sm text-muted">Uppdaterar din historik…</p> : null}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Genomförda ritualer",
            value: String(snapshot.stats.ritualCount),
            icon: Check,
          },
          {
            label: "Kvällar du kom tillbaka",
            value: `${snapshot.stats.completedLastSevenDays} av 7`,
            icon: CalendarDays,
          },
          {
            label: "Hjälpsamma meddelanden",
            value:
              snapshot.stats.helpfulPercent === null
                ? "–"
                : `${snapshot.stats.helpfulPercent}%`,
            icon: Heart,
          },
          {
            label: "Avklarade målsteg",
            value: `${snapshot.stats.completedGoalSteps} av ${snapshot.stats.totalGoalSteps}`,
            icon: Goal,
          },
        ].map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <Icon aria-hidden="true" size={19} className="text-brand-strong" />
            <p className="mt-5 text-2xl font-semibold tracking-tight">{value}</p>
            <p className="mt-1 text-sm text-muted">{label}</p>
          </Card>
        ))}
      </div>

      <Card className="mt-5">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm text-muted">Senaste sju dagarna</p>
            <h2 className="mt-1 text-xl font-semibold">Du har oftare valt lugn den här veckan.</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">Det här är en försiktig beskrivning av dina val, inte en medicinsk bedömning av hur du mår.</p>
          </div>
          <TrendingUp aria-hidden="true" size={24} className="text-success" />
        </div>
        <div className="mt-8 grid grid-cols-7 gap-2" aria-label="Ritualer senaste sju dagarna">
          {snapshot.week.map((day) => (
            <div key={day.day} className="text-center">
              <span className={`mx-auto grid aspect-square max-w-14 place-items-center rounded-2xl ${day.completed ? "bg-brand-soft text-brand-strong" : "bg-surface-muted text-muted"}`}>
                {day.completed ? <Check aria-hidden="true" size={18} /> : "–"}
              </span>
              <span className="mt-2 block text-xs font-semibold text-muted">{day.day}</span>
              <span className="mt-1 hidden text-[0.65rem] text-muted sm:block">{day.mood ?? "Paus"}</span>
            </div>
          ))}
        </div>
      </Card>

      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <Card>
          <p className="text-xs font-bold uppercase tracking-wider text-brand-strong">Senaste meddelandet</p>
          <blockquote className="mt-4 text-lg leading-8">“{lastMessage}”</blockquote>
          <p className="mt-5 text-xs text-muted">Senaste ritualen</p>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-brand-strong">Sparade</p>
              <h2 className="mt-1 text-lg font-semibold">Meddelanden du vill behålla</h2>
            </div>
            <Bookmark aria-hidden="true" size={20} className="text-muted" />
          </div>
          {savedMessages.length ? (
            <ul className="mt-4 space-y-3 text-sm leading-6">
              {savedMessages.slice(0, 4).map((message) => <li key={message} className="rounded-xl bg-surface-muted p-3">{message}</li>)}
            </ul>
          ) : (
            <p className="mt-5 text-sm leading-6 text-muted">Inget sparat ännu. Du kan spara ett meddelande efter ritualen eller i Utforska.</p>
          )}
        </Card>
      </div>
    </div>
  );
}
