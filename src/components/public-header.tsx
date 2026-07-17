import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { ButtonLink } from "@/components/ui/button";

export function PublicHeader() {
  return (
    <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
      <Logo />
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <ButtonLink href="/logga-in" variant="ghost" className="hidden sm:inline-flex">
          Logga in
        </ButtonLink>
        <ButtonLink href="/skapa-konto" className="min-h-11 px-4">
          Kom igång
        </ButtonLink>
      </div>
    </header>
  );
}
