# Lanseringschecklista och öppna beslut

## Blockerande före offentlig lansering

### Juridik och integritet

- [ ] Fastställ personuppgiftsansvarig, kontaktväg och eventuell DPO.
- [ ] Genomför DPIA för känslig fritext, AI och minderåriga.
- [ ] Bestäm minimiålder och när vårdnadshavares samtycke krävs.
- [ ] Juristgranska integritetspolicy, villkor, cookieflöde och Premiumvillkor.
- [ ] Teckna DPA och dokumentera underbiträden/överföringar.
- [ ] Fastställ och implementera slutliga gallringstider samt legal hold.
- [ ] Verifiera dataexport/radering hos samtliga leverantörer och backuper.
- [ ] Förbered IMY-/incidentprocess och 72-timmarsbedömning.

### Säkerhet och trygghet

- [ ] Extern penetrationstest av auth, RLS, admin och API.
- [ ] Aktivera MFA för moderator/admin och separata adminsessioner.
- [ ] Kör RLS-isoleringstest med två riktiga användare för varje tabell.
- [ ] Klinisk/säkerhetsmässig granskning av klassificering, språk och resurser.
- [ ] Verifiera 112/1177/Mind/Bris och ansvarig kvartalsrutin.
- [ ] Genomför AI-eval och red team enligt `AI-EVALS.md`.
- [ ] Sätt kostnadstak, incidentlarm, kill switch och övad rollback.
- [ ] Säkerställ att loggar aldrig innehåller ritual/chatt-request bodies.

### Teknik och drift

- [ ] Skapa separata Supabase dev/test/prod i EU-region.
- [ ] Kör migrering/seed och testa återläsning av backup.
- [ ] Konfigurera SMTP, bounce/abuse och kontobekräftelse.
- [ ] Kör Playwright på Chromium/WebKit i CI och riktiga mobiler.
- [ ] WCAG 2.2 AA-granskning med tangentbord och skärmläsare.
- [ ] Lasttest av ritual, rate limit, fallback och modereringskö.
- [ ] Sätt SLO, on-call-ägare och status-/supportkanal.
- [ ] Säkerställ att demo-flaggor är avstängda i produktion.
- [ ] Kör dependency-audit i CI och ompröva PostCSS-overriden vid varje Next.js-uppgradering.

## Affärsbeslut

- [ ] Ska Premium faktiskt kosta 19 kr/mån inklusive moms?
- [ ] Finns provperiod, familjeplan, skollicens eller årsplan?
- [ ] Vilka Premiumfunktioner ger värde utan att gratisläget blir otillräckligt?
- [ ] Ska annonser lanseras alls i en produkt med känslig kontext?
- [ ] Om ja: verifiera 250 kr/mån, annonskategorier, fakturering och gransknings-SLA.
- [ ] Vem skriver och professionellt granskar redaktionellt innehåll?
- [ ] Vem äger communitymoderering kvällar/helger?

## Rekommenderad lanseringssekvens

1. **Intern alpha, 20 personer:** endast reservmeddelanden + test-AI, inga annonser/Premium/community.
2. **Stängd beta, 100–300 personer:** AI canary, mål/historik, support och safety monitoring.
3. **Öppen svensk beta:** community efter bemannad moderering; fortfarande ingen annonsprofilering.
4. **Kommersiell lansering:** Premium först efter betalnings- och konsumenträttstest. Annonser bedöms separat.

## Go/no-go-skydd

Lansera inte om något av följande gäller:

- ett hög-risk-guldfall får vanligt pepp eller annons,
- vanlig användare kan läsa annan användares data eller admininformation,
- fallback saknas när AI är nere,
- export/radering inte kan verifieras,
- krisresurser saknar namngiven ansvarig och granskningsdatum,
- juridiska texter fortfarande saknar bolags- och underbiträdesuppgifter,
- moderator-/incidentbemanning inte finns.
