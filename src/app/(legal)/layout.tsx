import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-background">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-5 sm:px-8"><Logo /><ThemeToggle /></div>
      </header>
      <main id="main-content" className="mx-auto max-w-3xl px-5 py-14 sm:px-8 sm:py-20">{children}</main>
    </div>
  );
}
