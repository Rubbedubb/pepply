"use client";

import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";
import { useLocalStorageValue, writeLocalStorage } from "@/lib/use-local-storage";

function subscribeToColorScheme(callback: () => void) {
  const query = window.matchMedia("(prefers-color-scheme: dark)");
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}

function getSystemDark() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function ThemeToggle() {
  const savedTheme = useLocalStorageValue("pepply-theme");
  const systemDark = useSyncExternalStore(
    subscribeToColorScheme,
    getSystemDark,
    () => false,
  );
  const dark =
    savedTheme === "dark" || (savedTheme !== "light" && systemDark);

  function toggle() {
    const next = !dark;
    document.documentElement.classList.toggle("dark", next);
    writeLocalStorage("pepply-theme", next ? "dark" : "light");
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="grid size-11 place-items-center rounded-full border border-border bg-surface text-muted transition hover:text-foreground"
      aria-label={dark ? "Byt till ljust läge" : "Byt till mörkt läge"}
    >
      {dark ? <Sun aria-hidden="true" size={19} /> : <Moon aria-hidden="true" size={19} />}
    </button>
  );
}
