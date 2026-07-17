"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useLocalStorageValue, writeLocalStorage } from "@/lib/use-local-storage";

export function CookieNotice() {
  const choice = useLocalStorageValue("pepply-cookie-choice");
  const visible = choice === null;

  function choose(value: "necessary" | "analytics") {
    writeLocalStorage("pepply-cookie-choice", value);
  }

  if (!visible) return null;

  return (
    <aside
      aria-label="Cookieval"
      className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-2xl rounded-[1.5rem] border border-border bg-surface p-4 shadow-soft sm:flex sm:items-center sm:gap-5 sm:p-5"
    >
      <div className="min-w-0 flex-1">
        <p className="font-semibold">Du bestämmer över dina data</p>
        <p className="mt-1 text-sm leading-6 text-muted">
          Nödvändiga cookies håller dig inloggad. Frivillig, integritetsvänlig analys aktiveras bara om du väljer det.{" "}
          <Link href="/integritet" className="font-semibold text-foreground underline underline-offset-4">
            Läs mer
          </Link>
        </p>
      </div>
      <div className="mt-4 flex shrink-0 gap-2 sm:mt-0">
        <Button variant="secondary" className="min-h-10 flex-1 px-4" onClick={() => choose("necessary")}>
          Bara nödvändiga
        </Button>
        <Button className="min-h-10 flex-1 px-4" onClick={() => choose("analytics")}>
          Tillåt analys
        </Button>
      </div>
    </aside>
  );
}
