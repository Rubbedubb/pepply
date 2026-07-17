import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";
import { CommunityForm } from "@/components/community-form";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { getAppUserSummary } from "@/lib/app-data";

export const metadata: Metadata = { title: "Bidra" };

export default async function ContributePage() {
  const user = await getAppUserSummary();
  return (
    <>
      <PageHeader
        eyebrow="Community utan social press"
        title="Skriv något som kan hjälpa en annan."
        description="Alla bidrag granskas innan publicering. Det finns inga följare, privata meddelanden eller öppna kommentarsfält."
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_21rem]">
        <CommunityForm displayName={user.displayName} />
        <aside>
          <Card className="lg:sticky lg:top-6">
            <span className="grid size-11 place-items-center rounded-2xl bg-brand-soft text-brand-strong"><ShieldCheck aria-hidden="true" size={20} /></span>
            <h2 className="mt-5 text-lg font-semibold">Vad moderatorn kontrollerar</h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-muted">
              {[
                "Respektfullt och relevant innehåll",
                "Inga medicinska påståenden eller diagnoser",
                "Inga självskadeinstruktioner eller olämpliga löften",
                "Inga personuppgifter, reklam eller kopierad text",
              ].map((item) => <li key={item} className="flex gap-2"><span aria-hidden="true">·</span>{item}</li>)}
            </ul>
            <p className="mt-5 border-t border-border pt-5 text-xs leading-5 text-muted">Ett avslag är ett modereringsbeslut om texten, inte ett omdöme om dig.</p>
          </Card>
        </aside>
      </div>
    </>
  );
}
