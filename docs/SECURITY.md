# Säkerhetsmodell och hotbild

## Tillgångar att skydda

1. Konton och sessionscookies.
2. Känslig ritual- och chattfritext.
3. Säkerhetshändelser och moderatorinformation.
4. Systemprompter, API-nycklar och service role.
5. Betalnings- och prenumerationsidentiteter.
6. Administratörsåtgärder och auditlogg.

## Förtroendegränser

- All klientinput är opålitlig, även data från egen UI.
- AI-utdata är opålitlig tills den passerat utdatafilter.
- Moderatorbeslut kräver både serverroll och RLS.
- Service role hålls utanför klient och vanliga användarflöden.
- Tredjepartswebhooks måste signaturverifieras innan de får mutera data.

## Kontroller

### Konto och session

- Supabase Auth med httpOnly-sessioncookies genom SSR-klient.
- `proxy.ts` är snabb optimistisk routingspärr, inte enda skydd.
- API och DAL använder `auth.getUser()` och säkra rollkontroller.
- E-postverifiering, MFA för admin och sessionslista ska slås på inför lansering.

### Auktorisering

- RLS på alla tabeller.
- Persondata använder `user_id = auth.uid()` i både `USING` och `WITH CHECK`.
- Moderator/admin kontrolleras av en säkerhetsdefinierad rollfunktion med låst `search_path`.
- Adminsidan serverrenderas dynamiskt och omdirigerar obehöriga.
- Auditlogg får inte innehålla rå ritual- eller chatttext.

### Input, API och missbruk

- Zod-schema och storleksgränser för varje muterande route.
- Databasbaserad rate limit med validering att nyckeln tillhör `auth.uid()`.
- CSP, frame denial, nosniff, referrer- och permissions-policy.
- PWA-cachen undantar `/api/` och ska inte lagra privat JSON.
- Rapporter, community och AI har separata kvoter i produktion.
- Serverfel loggas som strukturerad JSON med referens, feltyp och ofarlig kontext; request body, e-post, ritual- och chatttext är förbjuden loggkontext.

### AI och prompt injection

- Användartext läggs som data i en separat promptdel, inte som systeminstruktion.
- Systemprompt och leverantörsnyckel finns bara server-side.
- Kontexten är begränsad; full profil och full historik skickas aldrig som standard.
- Utdatafilter blockerar beroendespråk, falska löften, diagnoser och medicinråd.
- AI får inte använda verktyg eller hämta extern information i ritualen.
- Reservmeddelanden täcker leverantörsfel och underkänd utdata.

### Krisflöde

- Deterministisk pre-check före AI.
- Hög risk bypassar vanlig generering, annons, streak och gamification.
- Händelsen lagrar reason codes, inte full råtext.
- Kontaktresurser versionsmärks och granskas återkommande.
- Systemet är ett triageliknande säkerhetslager, inte medicinsk riskbedömning. Klinisk och juridisk granskning krävs.

### Data och integritet

- Dataminimering och tydlig export/radering.
- Föreslagen retention: chatt 30 dagar, rå check-in-note 90 dagar, safety 12 månader, audit 24 månader.
- Annonslogg saknar användare, IP, mood, tema och fritext.
- Sentry/analys måste ha redaction och får inte få request body från ritual/chatt.

## Hot och motåtgärder

| Hot | Motåtgärd | Kvarvarande risk |
|---|---|---|
| IDOR mot annan användares historik | DAL + RLS + test av UUID-byte | Felaktig framtida service-role-kod |
| Standardanvändare öppnar admin | serverroll + RLS + audit | Stulen adminsession; kräver MFA |
| Prompt injection avslöjar systemprompt | ingen systemprompt i klient, separerade roller, inget tool-use | Modell kan parafrasera stil; eval krävs |
| AI ger skadligt/falskt svar | pre-safety, output guard, moderering, fallback, rapport | Klassificerare har falska positiva/negativa |
| Emotionell annonsprofil | schemat saknar sådana fält; aggregerade event | Framtida analytics kan återinföra risk |
| Community publicerar skada | lokala regler + leverantörsmoderering, obligatorisk manuell kö, rapport, disable | Moderatorfel och köfördröjning |
| Kontoradering lämnar data | FK cascade + export/delete-test | Leverantörsbackuper och rättslig retention |
| DDoS/kostnadschock | rate limit, dagskvot, max tokens, fallback | Distribuerade konton/IP-angrepp |

## Säkerhetstest före lansering

- Byt användar-ID på varje privat API-fråga och verifiera tomt/403.
- Försök skriva `user_id` för annan användare.
- Testa adminroute och direkta DB-anrop med vanlig roll.
- Fuzza alla textgränser, unicode och oväntade MIME-typer.
- Kör prompt-injection- och kriseval från `AI-EVALS.md`.
- Verifiera kontoradering i primär DB, auth, leverantör och backup-policy.
- Rotera nycklar och verifiera att gamla inte fungerar.
- Genomför extern penetrationstest och DPIA.

## Incidentnivåer

- **P0:** aktiv dataläcka, felaktig akutinformation eller allvarligt skadligt AI-svar i stor skala. Stäng berörd feature flag, aktivera fallback, samla minsta logg och eskalera direkt.
- **P1:** behörighetsfel, betalningsfel eller modereringskö blockerad. Stoppa mutationer och återställ kontrollerat.
- **P2:** enskilda olämpliga svar eller UI-fel. Disable meddelande, granska prompt/eval och kommunicera med berörd användare vid behov.
