"use client";

import { ArrowRight, LoaderCircle } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function PremiumCta() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function checkout() {
    setLoading(true);
    const response = await fetch("/api/billing/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: "premium-monthly" }),
    });
    const payload = await response.json();
    if (response.ok && payload.url) window.location.assign(payload.url);
    else setMessage(payload.error ?? "Betalningen kunde inte startas.");
    setLoading(false);
  }

  return (
    <div>
      <Button type="button" className="w-full" onClick={checkout} disabled={loading}>
        {loading ? <LoaderCircle className="animate-spin" aria-hidden="true" size={18} /> : null}
        Välj Premium <ArrowRight aria-hidden="true" size={18} />
      </Button>
      {message ? <p role="status" className="mt-3 text-xs leading-5 text-muted">Demoläge: {message}</p> : null}
    </div>
  );
}
