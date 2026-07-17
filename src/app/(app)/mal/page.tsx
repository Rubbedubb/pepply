import type { Metadata } from "next";
import { GoalsClient } from "@/components/goals-client";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = { title: "Mål" };

export default function GoalsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Mindre steg"
        title="Mål utan skuld."
        description="Gör riktningen tydlig och nästa steg litet. Missade dagar räknas inte som misslyckanden."
      />
      <GoalsClient />
    </>
  );
}
