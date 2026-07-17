import type { Metadata } from "next";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { RitualFlow } from "@/components/ritual-flow";

export const metadata: Metadata = { title: "Din kvällsritual" };

export default function RitualPage() {
  return (
    <div className="ritual-glow min-h-dvh">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-4 py-5 sm:px-7">
        <Logo href="/hem" />
        <Link href="/hem" className="inline-flex min-h-11 items-center gap-1 rounded-full px-3 text-sm font-semibold text-muted hover:bg-surface-muted hover:text-foreground">
          <ChevronLeft aria-hidden="true" size={18} /> Avsluta
        </Link>
      </header>
      <main id="main-content" className="px-5 sm:px-8">
        <RitualFlow />
      </main>
    </div>
  );
}
