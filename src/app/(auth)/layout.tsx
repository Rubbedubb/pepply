import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="pepply-gradient min-h-dvh">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
        <Logo />
        <ThemeToggle />
      </header>
      <main id="main-content" className="mx-auto grid min-h-[calc(100dvh-80px)] max-w-6xl place-items-center px-5 pb-16 sm:px-8">
        {children}
      </main>
    </div>
  );
}
