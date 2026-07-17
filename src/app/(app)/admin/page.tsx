import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminDashboard, type QueueItem } from "@/components/admin-dashboard";
import { PageHeader } from "@/components/page-header";
import { getRequestUserWithRole, isRequestDemo } from "@/lib/request-user";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Administration" };
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  try {
    await getRequestUserWithRole(["moderator", "admin"]);
  } catch {
    redirect("/hem");
  }

  let initialItems: QueueItem[] | undefined;
  let loadError = false;
  if (!isRequestDemo()) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("community_submissions")
      .select(
        "id, content, category, attribution, moderation_cases(automated_flags)",
      )
      .eq("status", "pending")
      .order("created_at", { ascending: true })
      .limit(50);

    if (error) {
      loadError = true;
      initialItems = [];
    } else {
      initialItems = (data ?? []).map((item) => {
        const cases = Array.isArray(item.moderation_cases)
          ? item.moderation_cases
          : item.moderation_cases
            ? [item.moderation_cases]
            : [];
        return {
          id: item.id,
          text: item.content,
          category: item.category,
          author:
            item.attribution === "anonymous"
              ? "Anonym"
              : "Namngiven användare",
          flags: [...new Set(cases.flatMap((item) => item.automated_flags ?? []))],
        };
      });
    }
  }

  return (
    <>
      <PageHeader eyebrow="Skyddad vy" title="Administration" description="Modereringskö, säkerhet, AI-kostnader och produktstyrning. Känsliga åtgärder auditloggas." />
      <AdminDashboard initialItems={initialItems} loadError={loadError} />
    </>
  );
}
