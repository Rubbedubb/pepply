"use client";

import { ExternalLink } from "lucide-react";
import { useEffect } from "react";

const adId = "20000000-0000-4000-8000-000000000001";

export function AdBanner() {
  useEffect(() => {
    fetch("/api/ads/impression", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ advertisementId: adId }),
    }).catch(() => undefined);
  }, []);

  async function trackClick() {
    await fetch("/api/ads/click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ advertisementId: adId }),
    }).catch(() => undefined);
  }

  return (
    <a
      href="https://example.com"
      target="_blank"
      rel="sponsored noreferrer"
      onClick={trackClick}
      className="mt-8 flex items-center gap-4 rounded-2xl border border-border bg-surface p-3 text-left transition hover:bg-surface-muted"
      aria-label="Annons från Bokhörnan"
    >
      <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-[#dce8d1] text-sm font-bold text-[#36553b]">BH</span>
      <span className="min-w-0 flex-1">
        <span className="block text-[0.65rem] font-bold uppercase tracking-wider text-muted">Annons</span>
        <span className="mt-0.5 block text-sm font-semibold">Bokhörnan · lugn läsning för sensommarkvällar</span>
      </span>
      <ExternalLink aria-hidden="true" size={17} className="shrink-0 text-muted" />
    </a>
  );
}
