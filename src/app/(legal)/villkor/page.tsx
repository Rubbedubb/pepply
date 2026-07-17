import type { Metadata } from "next";

export const metadata: Metadata = { title: "Användarvillkor" };

export default function TermsPage() {
  return (
    <article>
      <p className="text-sm font-semibold text-brand-strong">Utkast · version 2026-07-17</p>
      <h1 className="text-balance mt-3 text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">Användarvillkor för Pepply</h1>
      <p className="mt-6 text-lg leading-8 text-muted">Detta utkast är inte juridiskt slutgranskat. Bolagsuppgifter, konsumenträtt, åldersgräns och betalningsvillkor måste anpassas innan offentlig lansering.</p>
      <div className="mt-10 space-y-9 leading-7 text-muted">
        <section><h2 className="text-xl font-semibold text-foreground">1. Vad Pepply är</h2><p className="mt-3">Pepply erbjuder personliga stödjande meddelanden, reflektion, mål och kuraterat communityinnehåll. Pepply är inte vård, diagnostik, psykoterapi eller akuttjänst. Vid akut fara ska du ringa 112.</p></section>
        <section><h2 className="text-xl font-semibold text-foreground">2. Konto och säkerhet</h2><p className="mt-3">Du ansvarar för korrekta kontouppgifter och för att skydda din inloggning. Konton får inte delas eller användas för att kringgå säkerhets- eller modereringsåtgärder.</p></section>
        <section><h2 className="text-xl font-semibold text-foreground">3. AI-genererat innehåll</h2><p className="mt-3">AI kan ha fel och meddelanden ska inte betraktas som professionella råd. Rapportera olämpligt innehåll. Pepply använder säkerhetslager och reservmeddelanden men kan inte garantera att varje genererat svar är perfekt.</p></section>
        <section><h2 className="text-xl font-semibold text-foreground">4. Communitybidrag</h2><p className="mt-3">Du får bara skicka innehåll du har rätt att publicera och som inte innehåller personuppgifter, trakasserier, medicinska påståenden, självskadeinstruktioner, reklam eller intrång i annans rätt. Bidrag modereras före publicering och kan tas bort.</p></section>
        <section><h2 className="text-xl font-semibold text-foreground">5. Premium och betalning</h2><p className="mt-3">Föreslaget pris är 19 kr per månad och kan ändras för framtida perioder med tydlig information. Slutliga regler för ångerrätt, uppsägning, återbetalning och prisändringar ska juridiskt granskas och visas före köp.</p></section>
        <section><h2 className="text-xl font-semibold text-foreground">6. Tillgänglighet och ändringar</h2><p className="mt-3">Tjänsten kan tillfälligt vara otillgänglig för underhåll eller säkerhetsarbete. Väsentliga villkorsändringar meddelas i rimlig tid och samtyckesversioner loggas när det krävs.</p></section>
        <section><h2 className="text-xl font-semibold text-foreground">7. Avsluta konto</h2><p className="mt-3">Du kan avsluta kontot i Inställningar. Viss information kan behöva bevaras en begränsad tid för rättsliga skyldigheter, säkerhet eller tvist, med dokumenterad grund och åtkomstbegränsning.</p></section>
      </div>
    </article>
  );
}
