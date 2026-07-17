import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { SettingsPanel } from "@/components/settings-panel";
import { getSettingsData } from "@/lib/app-data";

export const metadata: Metadata = { title: "Inställningar" };

export default async function SettingsPage() {
  const settings = await getSettingsData();
  return (
    <>
      <PageHeader eyebrow="Du bestämmer" title="Inställningar" description="Styr ton, påminnelser, historik och vad Pepply får använda för personalisering." />
      <SettingsPanel initialSettings={settings} />
    </>
  );
}
