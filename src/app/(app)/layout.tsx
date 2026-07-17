import { AppShell } from "@/components/app-shell";
import { redirect } from "next/navigation";
import { getAppUserSummary } from "@/lib/app-data";

export const dynamic = "force-dynamic";

export default async function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const user = await getAppUserSummary().catch(() => redirect("/logga-in"));
  return <AppShell user={user}>{children}</AppShell>;
}
