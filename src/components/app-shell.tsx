"use client";

import {
  Bot,
  Compass,
  Crown,
  Goal,
  HeartHandshake,
  History,
  Home,
  Menu,
  Settings,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/cn";
import type { AppUserSummary } from "@/lib/app-data";

const navigation = [
  { href: "/hem", label: "Hem", icon: Home },
  { href: "/ai-chatt", label: "AI-chatt", icon: Bot },
  { href: "/mal", label: "Mål", icon: Goal },
  { href: "/historik", label: "Historik", icon: History },
  { href: "/utforska", label: "Utforska", icon: Compass },
  { href: "/bidra", label: "Bidra", icon: HeartHandshake },
];

const secondary = [
  { href: "/premium", label: "Premium", icon: Crown },
  { href: "/konto", label: "Mitt konto", icon: UserRound },
  { href: "/installningar", label: "Inställningar", icon: Settings },
  { href: "/admin", label: "Admin", icon: ShieldCheck },
];

function NavLink({ href, label, icon: Icon, pathname }: (typeof navigation)[number] & { pathname: string }) {
  const active = pathname === href || pathname.startsWith(`${href}/`);
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex min-h-11 items-center gap-3 rounded-2xl px-3.5 text-sm font-medium transition",
        active ? "bg-brand-soft text-foreground" : "text-muted hover:bg-surface-muted hover:text-foreground",
      )}
    >
      <Icon aria-hidden="true" size={19} strokeWidth={active ? 2.4 : 2} />
      {label}
    </Link>
  );
}

export function AppShell({ children, user }: { children: ReactNode; user: AppUserSummary }) {
  const pathname = usePathname();

  return (
    <div className="min-h-dvh bg-background">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-border bg-surface px-4 py-5 lg:flex">
        <Logo href="/hem" className="px-2" />
        <nav aria-label="Huvudnavigation" className="mt-9 flex flex-col gap-1">
          {navigation.map((item) => <NavLink key={item.href} {...item} pathname={pathname} />)}
        </nav>
        <div className="mt-auto border-t border-border pt-4">
          <nav aria-label="Kontonavigation" className="flex flex-col gap-1">
            {secondary
              .filter(
                (item) =>
                  item.href !== "/admin" ||
                  user.role === "moderator" ||
                  user.role === "admin",
              )
              .map((item) => <NavLink key={item.href} {...item} pathname={pathname} />)}
          </nav>
          <div className="mt-4 flex items-center justify-between px-2">
            <div>
              <p className="text-sm font-semibold">{user.displayName}</p>
              <p className="text-xs text-muted">{user.plan}</p>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-background/90 px-4 backdrop-blur-lg lg:hidden">
          <Logo href="/hem" />
          <Link
            href="/konto"
            className="grid size-11 place-items-center rounded-full border border-border bg-surface"
            aria-label="Öppna meny och konto"
          >
            <Menu aria-hidden="true" size={20} />
          </Link>
        </header>

        <main id="main-content" className="mx-auto w-full max-w-6xl px-4 pb-28 pt-7 sm:px-7 sm:pt-10 lg:px-10 lg:pb-12">
          {children}
        </main>
      </div>

      <nav
        aria-label="Mobilnavigation"
        className="fixed inset-x-3 bottom-3 z-30 grid grid-cols-5 rounded-[1.35rem] border border-border bg-surface/95 p-1.5 shadow-soft backdrop-blur-lg lg:hidden"
      >
        {[
          { href: "/hem", label: "Hem", icon: Home },
          { href: "/ai-chatt", label: "Chatt", icon: Bot },
          { href: "/mal", label: "Mål", icon: Goal },
          { href: "/utforska", label: "Utforska", icon: Compass },
          { href: "/konto", label: "Mer", icon: Menu },
        ].map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl text-[0.68rem] font-semibold transition",
                active ? "bg-brand-soft text-foreground" : "text-muted",
              )}
            >
              <Icon aria-hidden="true" size={19} strokeWidth={active ? 2.5 : 2} />
              {label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
