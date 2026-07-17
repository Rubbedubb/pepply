"use client";

import { Check, ChevronDown, Download, Eye, LoaderCircle, Monitor, Moon, Save, Shield, Sun, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormField, Input } from "@/components/ui/form-field";
import type { SettingsData } from "@/lib/app-data";
import { supportAreas, toneOptions, type MessageLength, type SupportArea, type ToneOption } from "@/lib/types";
import { writeLocalStorage } from "@/lib/use-local-storage";

function Toggle({ checked, onChange, label, description }: { checked: boolean; onChange: () => void; label: string; description: string }) {
  return (
    <button type="button" onClick={onChange} aria-pressed={checked} className="flex w-full items-center justify-between gap-5 py-4 text-left">
      <span><span className="block text-sm font-semibold">{label}</span><span className="mt-1 block text-xs leading-5 text-muted">{description}</span></span>
      <span className={`relative h-6 w-11 shrink-0 rounded-full transition ${checked ? "bg-brand" : "bg-surface-muted"}`}>
        <span className={`absolute top-1 size-4 rounded-full bg-white transition ${checked ? "left-6" : "left-1"}`} />
      </span>
    </button>
  );
}

export function SettingsPanel({ initialSettings }: { initialSettings: SettingsData }) {
  const [tone, setTone] = useState<ToneOption>(initialSettings.tone);
  const [length, setLength] = useState<MessageLength>(initialSettings.messageLength);
  const [time, setTime] = useState(initialSettings.reminderTime);
  const [reminders, setReminders] = useState(initialSettings.remindersEnabled);
  const [streaks, setStreaks] = useState(initialSettings.streaksEnabled);
  const [history, setHistory] = useState(initialSettings.personalHistoryEnabled);
  const [areas, setAreas] = useState<SupportArea[]>(initialSettings.areas);
  const [theme, setThemePreference] = useState(initialSettings.theme);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deletePhrase, setDeletePhrase] = useState("");
  const [showAccountDelete, setShowAccountDelete] = useState(false);
  const [accountDeletePhrase, setAccountDeletePhrase] = useState("");
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  function toggleArea(area: SupportArea) {
    setAreas((current) => current.includes(area) ? current.length === 1 ? current : current.filter((item) => item !== area) : [...current, area]);
  }

  async function saveSettings() {
    setSaving(true);
    setSaved(false);
    const response = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tone, messageLength: length, reminderTime: time, remindersEnabled: reminders, streaksEnabled: streaks, personalHistoryEnabled: history, areas, theme }),
    });
    setSaving(false);
    setSaved(response.ok);
    if (!response.ok) setStatus("Inställningarna kunde inte sparas just nu.");
  }

  function applyTheme(nextTheme: "light" | "dark" | "system") {
    const dark =
      nextTheme === "dark" ||
      (nextTheme === "system" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", dark);
    setThemePreference(nextTheme);
    writeLocalStorage("pepply-theme", nextTheme);
  }

  async function clearHistory() {
    if (deletePhrase !== "RENSA MIN HISTORIK") return;
    const response = await fetch("/api/account/history", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirmation: deletePhrase }),
    });
    if (response.ok) {
      ["pepply-last-message", "pepply-last-ritual-date", "pepply-saved-messages"].forEach((key) => localStorage.removeItem(key));
      setStatus("Din ritual-, chatt- och meddelandehistorik har rensats.");
      setShowDelete(false);
      setDeletePhrase("");
    } else {
      setStatus("Historiken kunde inte rensas just nu.");
    }
  }

  async function deleteAccount() {
    if (accountDeletePhrase !== "RADERA MITT KONTO") return;
    setDeletingAccount(true);

    const response = await fetch("/api/account/delete", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirmation: accountDeletePhrase }),
    });

    if (!response.ok) {
      setDeletingAccount(false);
      setStatus("Kontot kunde inte raderas just nu.");
      return;
    }

    Object.keys(localStorage)
      .filter((key) => key.startsWith("pepply-"))
      .forEach((key) => localStorage.removeItem(key));
    window.location.assign("/");
  }

  return (
    <div className="space-y-5">
      {status ? <p role="status" className="rounded-2xl bg-brand-soft p-4 text-sm">{status}</p> : null}

      <Card>
        <h2 className="text-xl font-semibold">Kvällsritual</h2>
        <p className="mt-1 text-sm text-muted">Justera hur Pepply formulerar och påminner.</p>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <FormField label="Önskad ton">
            <div className="relative"><select value={tone} onChange={(event) => setTone(event.target.value as ToneOption)} className="min-h-12 w-full appearance-none rounded-2xl border bg-surface px-4 pr-10 text-sm">{toneOptions.map((option) => <option key={option}>{option}</option>)}</select><ChevronDown className="pointer-events-none absolute right-3 top-3.5 text-muted" aria-hidden="true" size={18} /></div>
          </FormField>
          <FormField label="Meddelandelängd">
            <div className="flex min-h-12 rounded-2xl bg-surface-muted p-1">{(["kort", "utvecklad"] as MessageLength[]).map((option) => <button key={option} type="button" onClick={() => setLength(option)} className={`flex-1 rounded-xl text-sm font-semibold first-letter:uppercase ${length === option ? "bg-surface shadow-sm" : "text-muted"}`}>{option}</button>)}</div>
          </FormField>
          <FormField label="Påminnelsetid"><Input type="time" value={time} onChange={(event) => setTime(event.target.value)} /></FormField>
          <div className="rounded-2xl border px-4"><Toggle checked={reminders} onChange={() => setReminders((value) => !value)} label="Kvällspåminnelse" description="Lugn notis utan streak-press." /></div>
        </div>
        <div className="mt-6">
          <p className="mb-3 text-sm font-semibold">Valda områden</p>
          <div className="flex flex-wrap gap-2">{supportAreas.map((area) => <button key={area} type="button" onClick={() => toggleArea(area)} aria-pressed={areas.includes(area)} className={`min-h-10 rounded-full border px-4 text-sm font-semibold first-letter:uppercase ${areas.includes(area) ? "border-brand bg-brand-soft" : "bg-surface"}`}>{areas.includes(area) ? <Check className="mr-1.5 inline" aria-hidden="true" size={14} /> : null}{area}</button>)}</div>
        </div>
      </Card>

      <Card>
        <h2 className="text-xl font-semibold">Utseende och rytm</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <button type="button" aria-pressed={theme === "light"} onClick={() => applyTheme("light")} className={`flex min-h-12 items-center gap-3 rounded-2xl border px-4 text-sm font-semibold hover:bg-surface-muted ${theme === "light" ? "border-brand bg-brand-soft" : ""}`}><Sun aria-hidden="true" size={18} /> Ljust</button>
          <button type="button" aria-pressed={theme === "dark"} onClick={() => applyTheme("dark")} className={`flex min-h-12 items-center gap-3 rounded-2xl border px-4 text-sm font-semibold hover:bg-surface-muted ${theme === "dark" ? "border-brand bg-brand-soft" : ""}`}><Moon aria-hidden="true" size={18} /> Mörkt</button>
          <button type="button" aria-pressed={theme === "system"} onClick={() => applyTheme("system")} className={`flex min-h-12 items-center gap-3 rounded-2xl border px-4 text-sm font-semibold hover:bg-surface-muted ${theme === "system" ? "border-brand bg-brand-soft" : ""}`}><Monitor aria-hidden="true" size={18} /> System</button>
        </div>
        <div className="mt-4 divide-y divide-border">
          <Toggle checked={streaks} onChange={() => setStreaks((value) => !value)} label="Visa mjuk streak" description="En diskret rytm som belönar återkomst, inte perfektion." />
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-3"><Shield aria-hidden="true" size={21} className="text-brand-strong" /><h2 className="text-xl font-semibold">AI-minne och data</h2></div>
        <div className="mt-5 divide-y divide-border">
          <Toggle checked={history} onChange={() => setHistory((value) => !value)} label="Personlig historik" description="Använd relevanta tidigare betyg och ritualer för bättre meddelanden." />
          <div className="py-4">
            <div className="flex items-start gap-3"><Eye aria-hidden="true" size={18} className="mt-0.5 text-muted" /><div><p className="text-sm font-semibold">Det Pepply minns nu</p><ul className="mt-2 space-y-1 text-xs leading-5 text-muted"><li>Tilltalsnamn: {initialSettings.displayName}</li><li>Områden: {areas.join(", ")}</li><li>Ton: {tone}</li>{initialSettings.activeGoal ? <li>Aktivt mål: {initialSettings.activeGoal}</li> : null}</ul></div></div>
          </div>
          <a href="/api/account/export" className="flex min-h-16 items-center justify-between py-3 text-sm font-semibold"><span className="flex items-center gap-3"><Download aria-hidden="true" size={18} className="text-muted" />Exportera alla mina uppgifter</span><span className="text-xs font-normal text-muted">JSON</span></a>
          <div className="py-4">
            <p className="text-sm font-semibold">Cookie- och analysval</p>
            <p className="mt-1 text-xs leading-5 text-muted">Ändra frivillig analys när som helst. Nödvändiga sessionscookies går inte att stänga av medan du är inloggad.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button type="button" variant="secondary" className="min-h-10 px-4" onClick={() => { writeLocalStorage("pepply-cookie-choice", "necessary"); setStatus("Endast nödvändiga cookies används."); }}>Bara nödvändiga</Button>
              <Button type="button" variant="secondary" className="min-h-10 px-4" onClick={() => { writeLocalStorage("pepply-cookie-choice", "analytics"); setStatus("Integritetsvänlig analys är tillåten."); }}>Tillåt analys</Button>
            </div>
          </div>
          <button type="button" onClick={() => setShowDelete((value) => !value)} className="flex min-h-16 w-full items-center gap-3 py-3 text-left text-sm font-semibold text-danger"><Trash2 aria-hidden="true" size={18} />Rensa ritual- och chatthistorik</button>
        </div>

        {showDelete ? (
          <div className="mt-4 rounded-2xl border border-danger/30 bg-red-50 p-4 dark:bg-red-950/20">
            <p className="text-sm font-semibold">Detta kan inte ångras.</p>
            <p className="mt-1 text-xs leading-5 text-muted">Skriv <strong>RENSA MIN HISTORIK</strong>. Profilpreferenser och konto finns kvar.</p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row"><Input value={deletePhrase} onChange={(event) => setDeletePhrase(event.target.value)} placeholder="RENSA MIN HISTORIK" /><Button type="button" variant="danger" onClick={clearHistory} disabled={deletePhrase !== "RENSA MIN HISTORIK"}>Rensa</Button></div>
          </div>
        ) : null}
      </Card>

      <Card className="border-danger/25">
        <h2 className="text-xl font-semibold">Radera konto</h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          Kontot och personuppgifterna raderas permanent. Åtgärden går inte att
          ångra.
        </p>
        <Button
          type="button"
          variant="ghost"
          className="mt-4 px-0 text-danger hover:bg-transparent"
          onClick={() => setShowAccountDelete((value) => !value)}
        >
          <Trash2 aria-hidden="true" size={18} />
          Radera mitt konto
        </Button>

        {showAccountDelete ? (
          <div className="mt-3 rounded-2xl border border-danger/30 bg-red-50 p-4 dark:bg-red-950/20">
            <p className="text-sm font-semibold">Bekräfta permanent radering</p>
            <p className="mt-1 text-xs leading-5 text-muted">
              Skriv <strong>RADERA MITT KONTO</strong> för att fortsätta.
            </p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <Input
                value={accountDeletePhrase}
                onChange={(event) => setAccountDeletePhrase(event.target.value)}
                placeholder="RADERA MITT KONTO"
                autoComplete="off"
              />
              <Button
                type="button"
                variant="danger"
                onClick={deleteAccount}
                disabled={
                  accountDeletePhrase !== "RADERA MITT KONTO" ||
                  deletingAccount
                }
              >
                {deletingAccount ? (
                  <LoaderCircle
                    className="animate-spin"
                    aria-hidden="true"
                    size={18}
                  />
                ) : null}
                {deletingAccount ? "Raderar…" : "Radera permanent"}
              </Button>
            </div>
          </div>
        ) : null}
      </Card>

      <div className="sticky bottom-24 z-10 flex justify-end lg:bottom-5">
        <Button type="button" onClick={saveSettings} disabled={saving} className="shadow-soft">
          {saving ? <LoaderCircle className="animate-spin" aria-hidden="true" size={18} /> : saved ? <Check aria-hidden="true" size={18} /> : <Save aria-hidden="true" size={18} />}
          {saving ? "Sparar…" : saved ? "Sparat" : "Spara inställningar"}
        </Button>
      </div>
    </div>
  );
}
