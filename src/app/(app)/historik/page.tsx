import type { Metadata } from "next";
import { HistoryDashboard } from "@/components/history-dashboard";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = { title: "Historik" };

export default function HistoryPage() {
  return (
    <>
      <PageHeader
        eyebrow="Din historik"
        title="Se tillbaka utan att bli bedömd."
        description="En enkel överblick över ritualer, val och sparade meddelanden. Inga diagnoser eller tvärsäkra humöranalyser."
      />
      <HistoryDashboard />
    </>
  );
}
