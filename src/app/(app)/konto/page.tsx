import type { Metadata } from "next";
import { ChevronRight, Crown, Goal, History, Settings, ShieldCheck, UserRound } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { SignOutButton } from "@/components/sign-out-button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getAppUserSummary } from "@/lib/app-data";

export const metadata: Metadata = { title: "Mitt konto" };

const links = [
  { href: "/mal", label: "Mina mål", description: "2 aktiva mål", icon: Goal },
  { href: "/historik", label: "Historik och sparat", description: "Ritualer och meddelanden", icon: History },
  { href: "/premium", label: "Premium", description: "Gratisplan", icon: Crown },
  { href: "/installningar", label: "Inställningar och data", description: "Integritet, ton och påminnelser", icon: Settings },
];

export default async function AccountPage() {
  const user = await getAppUserSummary();
  return (
    <>
      <PageHeader eyebrow="Din översikt" title="Mitt konto" />
      <Card className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <span className="grid size-16 place-items-center rounded-3xl bg-brand-soft text-brand-strong"><UserRound aria-hidden="true" size={27} /></span>
          <div><h2 className="text-xl font-semibold">{user.displayName}</h2><p className="mt-1 text-sm text-muted">{user.email}</p><Badge className="mt-2">{user.plan}</Badge></div>
        </div>
        <Link href="/installningar" className="inline-flex min-h-11 items-center justify-center rounded-full border px-4 text-sm font-semibold">Redigera profil</Link>
      </Card>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {links.map(({ href, label, description, icon: Icon }) => (
          <Link key={href} href={href} className="group flex items-center gap-4 rounded-[1.5rem] border border-border bg-surface p-5 transition hover:bg-surface-muted">
            <span className="grid size-11 place-items-center rounded-2xl bg-brand-soft text-brand-strong"><Icon aria-hidden="true" size={19} /></span>
            <span className="min-w-0 flex-1"><span className="block font-semibold">{label}</span><span className="mt-1 block truncate text-sm text-muted">{description}</span></span>
            <ChevronRight aria-hidden="true" size={18} className="text-muted transition group-hover:translate-x-0.5" />
          </Link>
        ))}
      </div>

      <Card className="mt-5">
        <div className="flex items-center gap-3"><ShieldCheck aria-hidden="true" className="text-success" size={20} /><h2 className="font-semibold">Kontot är skyddat</h2></div>
        <p className="mt-2 text-sm leading-6 text-muted">E-postinloggning via Supabase Auth, dataåtkomst med row-level security och loggning av känsliga administratörsåtgärder.</p>
      </Card>

      <SignOutButton />
    </>
  );
}
