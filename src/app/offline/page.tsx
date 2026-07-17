import Link from "next/link";
import { Logo } from "@/components/logo";

export default function OfflinePage() {
  return (
    <main id="main-content" className="grid min-h-dvh place-items-center p-6">
      <div className="max-w-md text-center">
        <Logo className="mx-auto mb-8 justify-center" />
        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-brand-strong">
          Ingen anslutning
        </p>
        <h1 className="text-balance text-3xl font-semibold tracking-tight">
          Det är lugnt. Försök igen när nätet är tillbaka.
        </h1>
        <p className="mt-4 leading-7 text-muted">
          Pepply behöver anslutning för att skapa och spara ett personligt
          meddelande.
        </p>
        <Link
          href="/hem"
          className="mt-8 inline-flex min-h-12 items-center rounded-full bg-foreground px-6 font-semibold text-background"
        >
          Försök igen
        </Link>
      </div>
    </main>
  );
}
