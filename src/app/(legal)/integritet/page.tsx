import type { Metadata } from "next";

export const metadata: Metadata = { title: "Integritetspolicy" };

export default function PrivacyPage() {
  return (
    <article className="prose-pepply">
      <p className="text-sm font-semibold text-brand-strong">Utkast · version 2026-07-17</p>
      <h1 className="text-balance mt-3 text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">Din information ska inte kännas som priset för att få stöd.</h1>
      <p className="mt-6 text-lg leading-8 text-muted">Detta är ett produktionsnära utkast till Pepplys integritetspolicy. Det måste granskas av jurist och kompletteras med korrekt personuppgiftsansvarig, kontaktuppgifter och underbiträden före offentlig lansering.</p>

      <div className="mt-10 space-y-10 text-[0.98rem] leading-7">
        <section><h2 className="text-2xl font-semibold">Kortversionen</h2><ul className="mt-4 list-disc space-y-2 pl-5 text-muted"><li>Vi samlar bara in data som behövs för konto, ritual, personalisering, säkerhet och drift.</li><li>Din fritext används för det aktuella svaret men blir inte automatiskt permanent profilminne.</li><li>Känsligt måendedata används aldrig för annonsriktning.</li><li>Du kan se, exportera, rensa och radera dina uppgifter.</li><li>Grundläggande trygghetsfunktioner fungerar oavsett betalplan.</li></ul></section>

        <section><h2 className="text-2xl font-semibold">Vad vi behandlar</h2><p className="mt-3 text-muted">Kontouppgifter, valda profilpreferenser, samtycken, påminnelseval, mål, ritual- och check-inhistorik, meddelandebetyg, sparade meddelanden, communitybidrag, rapporter, prenumerationsstatus och nödvändiga säkerhets- och driftloggar. Betalningskort ska hanteras av betalningsleverantören och inte lagras av Pepply.</p></section>

        <section><h2 className="text-2xl font-semibold">AI och personlig historik</h2><p className="mt-3 text-muted">När personlig historik är på kan Pepply använda valda teman, ton, aktiva mål, tidigare betyg och ett begränsat urval av relevant ritualhistorik. Rå fritext ska gallras snabbare än strukturerade preferenser. AI-anrop görs server-side och ställs in för att inte lagras hos leverantören när den möjligheten finns. Exakta underbiträdesvillkor måste verifieras före lansering.</p></section>

        <section><h2 className="text-2xl font-semibold">Rättslig grund och samtycke</h2><p className="mt-3 text-muted">Avtal används för att leverera kontot och kärntjänsten. Samtycke används för frivillig analys, marknadsföringscookies och personlig AI-historik där så krävs. Berättigat intresse kan användas för proportionerlig säkerhet, bedrägeriskydd och teknisk drift efter dokumenterad intresseavvägning.</p></section>

        <section><h2 className="text-2xl font-semibold">Minderåriga</h2><p className="mt-3 text-muted">Pepply använder åldersanpassade texter och ska undvika onödig insamling. Exakt åldersgräns, vårdnadshavares samtycke och verifieringsmetod måste beslutas juridiskt per lanseringsmarknad. Barns data får inte användas för beteendebaserad reklam.</p></section>

        <section><h2 className="text-2xl font-semibold">Gallring</h2><p className="mt-3 text-muted">Föreslagen princip: rå ritualfritext högst 90 dagar som standard, AI-chatt högst 30 dagar om den inte sparas uttryckligen, säkerhetshändelser 12 månader med strikt åtkomst, auditloggar 24 månader och aggregerad annonsstatistik utan användarkoppling högst 25 månader. Tiderna ska fastställas genom juridisk och säkerhetsmässig granskning.</p></section>

        <section><h2 className="text-2xl font-semibold">Dina rättigheter</h2><p className="mt-3 text-muted">Du kan begära tillgång, rättelse, export, begränsning, invändning och radering enligt tillämplig lag. I Inställningar kan du direkt stänga av personlig historik, rensa historik, exportera data och initiera kontoradering. Du kan också lämna klagomål till Integritetsskyddsmyndigheten.</p></section>

        <section className="rounded-2xl border border-brand/30 bg-brand-soft p-5"><h2 className="text-lg font-semibold">Före lansering måste detta fyllas i</h2><p className="mt-2 text-sm text-muted">Bolagsnamn, organisationsnummer, fysisk adress, integritetskontakt/dataskyddsombud, komplett lista över underbiträden och överföringsmekanismer, faktiska gallringstider, åldersgräns samt datum för juridisk granskning.</p></section>
      </div>
    </article>
  );
}
