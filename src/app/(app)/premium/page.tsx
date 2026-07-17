import type { Metadata } from "next";
import { Check, Crown, ShieldCheck, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { PremiumCta } from "@/components/premium-cta";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = { title: "Premium" };

const free = ["En kvällsritual om dagen", "Grundläggande personalisering", "Mål och sparade meddelanden", "Alla trygghetsfunktioner"];
const premium = ["Allt i gratisversionen", "Fler ton- och längdval", "Utökad historik", "Fördjupade mål och fler teman", "Extra pepp vid behov", "Inga annonser"];

export default function PremiumPage() {
  return (
    <>
      <PageHeader
        eyebrow="Frivilligt stöd till produkten"
        title="Mer personalisering. Samma lugna kärna."
        description="Gratisversionen ska vara genuint användbar. Grundläggande trygghet och akuthjälp låses aldrig bakom betalning."
      />
      <div className="grid gap-5 md:grid-cols-2">
        <Card>
          <p className="text-sm font-semibold text-muted">Gratis</p>
          <p className="mt-4 text-4xl font-semibold tracking-tight">0 kr</p>
          <p className="mt-2 text-sm text-muted">För alltid</p>
          <ul className="mt-7 space-y-3 text-sm">
            {free.map((item) => <li key={item} className="flex gap-3"><Check className="mt-0.5 shrink-0 text-success" aria-hidden="true" size={17} />{item}</li>)}
          </ul>
          <div className="mt-8 rounded-2xl bg-surface-muted p-4 text-sm font-semibold">Din nuvarande plan</div>
        </Card>

        <Card className="relative overflow-hidden border-brand/50 bg-surface-soft shadow-soft">
          <div className="absolute right-0 top-0 size-40 translate-x-12 -translate-y-12 rounded-full bg-brand/15 blur-2xl" />
          <div className="relative">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2"><Crown aria-hidden="true" size={20} className="text-brand-strong" /><p className="font-semibold">Premium</p></div>
              <Badge>Riktpris</Badge>
            </div>
            <p className="mt-4 text-4xl font-semibold tracking-tight">19 kr <span className="text-base font-normal text-muted">/ månad</span></p>
            <p className="mt-2 text-sm text-muted">Priset styrs från administrationspanelen.</p>
            <ul className="mt-7 space-y-3 text-sm">
              {premium.map((item) => <li key={item} className="flex gap-3"><Check className="mt-0.5 shrink-0 text-success" aria-hidden="true" size={17} />{item}</li>)}
            </ul>
            <div className="mt-8"><PremiumCta /></div>
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="flex gap-3 rounded-2xl border border-border p-4 text-sm leading-6"><ShieldCheck className="mt-0.5 shrink-0 text-success" aria-hidden="true" size={19} /><p><strong>Ingen psykologisk annonsering.</strong><br /><span className="text-muted">Ditt mående, dina relationer och din fritext används aldrig för annonsriktning.</span></p></div>
        <div className="flex gap-3 rounded-2xl border border-border p-4 text-sm leading-6"><Sparkles className="mt-0.5 shrink-0 text-brand-strong" aria-hidden="true" size={19} /><p><strong>Ingen köpstress.</strong><br /><span className="text-muted">Inga nedräkningar, falska rabatter eller skuldbeläggande uppgraderingar.</span></p></div>
      </div>
    </>
  );
}
