import {
  ArrowRight,
  Check,
  Clock3,
  Heart,
  LockKeyhole,
  MoonStar,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { PublicHeader } from "@/components/public-header";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const principles = [
  {
    icon: Clock3,
    title: "En minut räcker",
    text: "Ingen oändlig feed. När kvällens meddelande är klart säger Pepply att du är färdig.",
  },
  {
    icon: Heart,
    title: "Varmt, inte tillgjort",
    text: "Pepply erkänner när något är svårt och undviker tomma löften och toxisk positivitet.",
  },
  {
    icon: LockKeyhole,
    title: "Du styr minnet",
    text: "Se, radera eller stäng av det som används för personalisering. Känslig fritext blir inte automatiskt en profilfakta.",
  },
];

export default function LandingPage() {
  return (
    <div className="pepply-gradient min-h-dvh">
      <PublicHeader />
      <main id="main-content">
        <section className="mx-auto grid w-full max-w-7xl items-center gap-12 px-5 pb-24 pt-12 sm:px-8 sm:pt-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20 lg:pb-32">
          <div className="fade-up max-w-2xl">
            <Badge className="mb-6 gap-2 py-1.5">
              <MoonStar aria-hidden="true" size={14} />
              En lugn kvällsritual
            </Badge>
            <h1 className="text-balance text-[clamp(3rem,7vw,5.7rem)] font-semibold leading-[0.98] tracking-[-0.065em]">
              Avsluta dagen lite <span className="text-brand-strong">lugnare.</span>
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-muted sm:text-xl">
              Svara på en enkel fråga. Få ett enda personligt meddelande som möter dagen som den faktiskt var. Sedan är du klar.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/skapa-konto" className="px-7">
                Börja din minut
                <ArrowRight aria-hidden="true" size={18} />
              </ButtonLink>
              <ButtonLink href="/hem" variant="secondary" className="px-7">
                Prova demoläget
              </ButtonLink>
            </div>
            <p className="mt-5 flex items-center gap-2 text-sm text-muted">
              <Check aria-hidden="true" size={16} className="text-success" />
              Gratis att börja · ingen prestation · avsluta när du vill
            </p>
          </div>

          <div className="fade-up relative mx-auto w-full max-w-lg lg:mx-0" style={{ animationDelay: "120ms" }}>
            <div className="absolute -inset-8 -z-10 rounded-full bg-brand/10 blur-3xl" />
            <Card className="shadow-soft overflow-hidden border-white/60 p-0 dark:border-border">
              <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <Logo href="/" />
                <span className="rounded-full bg-surface-muted px-3 py-1 text-xs font-semibold text-muted">21:34</span>
              </div>
              <div className="px-6 py-10 text-center sm:px-10 sm:py-12">
                <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-brand-soft text-brand-strong">
                  <Sparkles aria-hidden="true" size={21} />
                </span>
                <p className="mt-7 text-sm font-semibold text-brand-strong">Din minut i kväll</p>
                <h2 className="mt-3 text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
                  Vad tog mest energi i dag?
                </h2>
                <div className="mt-7 grid grid-cols-2 gap-2">
                  {["Skolan", "Andra människor", "Mina tankar", "Något annat"].map((answer, index) => (
                    <span
                      key={answer}
                      className={`rounded-2xl border px-3 py-3 text-sm font-medium ${index === 2 ? "border-brand bg-brand-soft" : "bg-surface"}`}
                    >
                      {answer}
                    </span>
                  ))}
                </div>
                <div className="mt-7 rounded-3xl bg-surface-soft p-5 text-left">
                  <p className="leading-7">
                    Du behöver inte reda ut varje tanke innan du somnar. Att de tog mycket plats i dag betyder inte att du måste ge dem resten av kvällen också.
                  </p>
                </div>
              </div>
            </Card>
            <div className="absolute -bottom-5 -left-4 hidden items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3 shadow-soft sm:flex">
              <span className="grid size-9 place-items-center rounded-xl bg-[#e5f2e8] text-success dark:bg-[#203a27]">
                <Check aria-hidden="true" size={18} />
              </span>
              <div>
                <p className="text-xs text-muted">Kvällsritual</p>
                <p className="text-sm font-semibold">Färdig för i kväll</p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-border bg-surface/65">
          <div className="mx-auto grid max-w-7xl gap-5 px-5 py-20 sm:px-8 md:grid-cols-3 md:py-24">
            {principles.map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-[1.75rem] p-2 sm:p-5">
                <span className="grid size-12 place-items-center rounded-2xl bg-brand-soft text-brand-strong">
                  <Icon aria-hidden="true" size={21} />
                </span>
                <h2 className="mt-5 text-xl font-semibold tracking-tight">{title}</h2>
                <p className="mt-2 leading-7 text-muted">{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-5 py-24 text-center sm:px-8 sm:py-32">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand-strong">Pepply i praktiken</p>
          <h2 className="text-balance mt-4 text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">
            Inte ännu en app som ber dig göra mer.
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted">
            Pepply mäter inte framgång i skärmtid. Målet är att du ska genomföra en liten handling, känna att den räckte och lägga undan appen.
          </p>
          <ButtonLink href="/skapa-konto" className="mt-9 px-7">
            Skapa ett gratis konto
            <ArrowRight aria-hidden="true" size={18} />
          </ButtonLink>
        </section>
      </main>

      <footer className="border-t border-border bg-surface">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <Logo />
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <Link href="/integritet" className="hover:text-foreground">Integritet</Link>
            <Link href="/villkor" className="hover:text-foreground">Villkor</Link>
            <Link href="/logga-in" className="hover:text-foreground">Logga in</Link>
          </div>
          <p>© 2026 Pepply</p>
        </div>
      </footer>
    </div>
  );
}
