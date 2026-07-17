# Pepply

Pepply är en svensk, installerbar webbapp för en en minut lång kvällsritual. Användaren svarar kort på hur dagen varit, får ett enda personligt och jordnära meddelande och blir sedan tydligt färdig för kvällen.

Det här repot är en produktionsnära fullstackgrund, inte bara en visuell prototyp. Kärnflöden, responsiv UI, PWA, API-routes, AI-/reservlager, krisflöde, databasmodell, RLS, adminvy, tester och driftunderlag ingår. Externa tjänster kräver egna nycklar och vissa affärsintegrationer är medvetet lämnade som adaptrar; se [docs/STATUS.md](docs/STATUS.md).

## Snabbstart i demoläge

Krav: Node.js 22 eller senare och npm 10 eller senare.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Öppna `http://localhost:3000`. `.env.example` startar ett tydligt demoläge. Demoläget använder webbläsarens lokala lagring och kan köras publikt under den kostnadsfria första betan, men är inte samma sak som ett färdigt produktionsläge med riktiga konton och datalagring.

Viktigaste sidorna:

- `/` – landningssida
- `/hem` – kvällens startläge
- `/ritual` – kärnritual utan distraherande navigation
- `/ai-chatt`, `/mal`, `/historik`, `/utforska`, `/bidra`
- `/premium`, `/konto`, `/installningar`
- `/admin` – rollskyddad adminvy (admin i demoläge)

## Produktionskoppling

### 1. Supabase

1. Skapa ett Supabase-projekt i önskad EU-region.
2. Installera Supabase CLI och länka projektet.
3. Kör de tre migreringarna i ordning:

```bash
supabase db push
supabase db seed
```

4. Lägg in projektets URL och anon-nyckel i Vercel/hosting.
5. Lägg `SUPABASE_SERVICE_ROLE_KEY` endast som serverhemlighet.
6. Lägg produktionsdomänen och `/auth/callback` i Supabase Auths tillåtna redirect-URL:er.
7. Skapa första adminrollen manuellt i SQL-editorn efter verifierad inloggning:

```sql
update public.user_roles
set role = 'admin'
where user_id = '<verifierad-user-uuid>';
```

RLS är aktiverat på samtliga tabeller. UI-döljning är aldrig enda behörighetskontrollen; API och dataåtkomst verifierar användare och roll på serversidan.

### 2. AI

För nollkostnadsdrift sätts `CLOUDFLARE_ACCOUNT_ID` och `CLOUDFLARE_API_TOKEN` som servervariabler för Workers AI Free. Modellen är låst till den flerspråkiga `@cf/meta/llama-3.1-8b-instruct-fp8-fast`. Cloudflares fria tilldelning är 10 000 neuroner per dygn; på Workers Free stoppas ytterligare anrop när den är slut. Pepply fångar det felet och använder ett granskat reservmeddelande automatiskt.

Pepply försöker högst tre AI-genereringar per användare och dygn, gemensamt för ritual och chatt. Ett högre värde i `AI_DAILY_USER_LIMIT` kapas ändå till tre. I demoläge används en anonym httpOnly-cookie för att skilja webbläsare åt och en lokal skyddsgräns per serverinstans; i kontoläge är gränsen atomisk i Supabase. Cloudflares Free-plan är det slutliga globala kostnadsskyddet. Uppgradera inte Cloudflare-kontot till Workers Paid om ägarkostnaden måste förbli 0 kr.

OpenAI-adaptern finns kvar för eventuell framtida utveckling men används inte som automatisk reserv för generering. Lämna `OPENAI_API_KEY` tom för nollkostnadsdriften.

Varje generering har:

1. deterministisk svensk riskklassificering,
2. versionshanterad stil- och systemprompt,
3. begränsat relevant kontext,
4. utdatafilter för diagnoser, falsk säkerhet och beroendeskapande språk,
5. granskade reservmeddelanden vid saknad nyckel, fel eller underkänd utdata,
6. kostnads- och användningsgräns.

I skarp drift hämtas ton, områden, aktivt mål, högst fem nyliga formuleringar och högst fem betyg på servern under användarens RLS. Historiken läses inte alls när användaren har stängt av personlig historik.

Krisresurserna verifierades 2026-07-17 mot 1177 och Mind. De ska granskas minst kvartalsvis och före varje publik lansering.

### 3. Betalning och push

Gränssnitten är separerade från produkten, men Stripe-checkout och VAPID-utskick är inte implementerade som skarpa leverantörsanrop. Slå inte på funktionsflaggorna förrän leverantör, konsumentvillkor, webhook-signering, återbetalningar och incidenthantering är klara.

## Miljövariabler

| Variabel | Exponering | Syfte |
|---|---|---|
| `NEXT_PUBLIC_APP_URL` | Klient | Kanonisk app-URL |
| `PEPPLY_DEMO_MODE` | Server | Lokalt demoläge; måste vara `false`/saknas i prod |
| `NEXT_PUBLIC_DEMO_MODE` | Klient | Visuellt/klickbart demoläge |
| `NEXT_PUBLIC_SUPABASE_URL` | Klient | Supabase-projekt |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Klient | RLS-begränsad publik nyckel |
| `SUPABASE_SERVICE_ROLE_KEY` | Serverhemlighet | Kontoradering och kontrollerade adminjobb |
| `CLOUDFLARE_ACCOUNT_ID` | Server | Cloudflare-konto för Workers AI |
| `CLOUDFLARE_API_TOKEN` | Serverhemlighet | Workers AI-token; får aldrig exponeras i klienten |
| `CLOUDFLARE_AI_MODEL` | Server | Låst till `@cf/meta/llama-3.1-8b-instruct-fp8-fast` |
| `OPENAI_API_KEY` | Serverhemlighet | AI-adapter |
| `OPENAI_MODEL` | Server | Modell-ID |
| `OPENAI_MODERATION_MODEL` | Server | Modereringsmodell |
| `AI_DAILY_USER_LIMIT` | Server | Gemensam genereringsgräns per användare/dygn, hårdkapad till 3 |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Klient | Framtida pushprenumeration |
| `VAPID_PRIVATE_KEY` | Serverhemlighet | Framtida pushutskick |
| `STRIPE_*` | Blandat | Framtida betalningsadapter |
| `SENTRY_DSN` | Server | Framtida felövervakning; filtrera känslig text |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | Klient | Frivillig integritetsvänlig analys |

Se [.env.example](.env.example) för hela listan.

## Kommandon

```bash
npm run dev          # lokal utveckling
npm run lint         # ESLint, noll varningar
npm run typecheck    # strikt TypeScript
npm test             # Vitest
npm run test:e2e     # Playwright, kräver installerade browser binaries
npm run build        # optimerad produktionsbyggnad
npm run verify       # lint + typer + unit + build
```

Verifierat i denna leverans:

- lint: godkänd utan varningar
- strikt TypeScript: godkänd
- 34 enhetstester: godkända
- Next.js produktionsbyggnad: godkänd, 42 app-rutter
- produktionsdependency-audit: 0 kända sårbarheter
- HTTP-smoke: landningssida, hem, health, vanlig ritual, akut säkerhetsritual, favoriter, rapport och kontoradering: godkända
- Playwright-sviten har 13 scenarier som körs i både desktop- och mobilprojekt, men browserkörning kunde inte slutföras i den här byggmiljön eftersom Chromium-binären inte är installerad. Kör `npx playwright install chromium` och `npm run test:e2e` i CI eller lokal standardmiljö.

`package.json` har en avgränsad override till PostCSS 8.5.19 eftersom Next.js 16.2.10 annars installerar en äldre sårbar intern version. Behåll den tills Next.js beroendeträd själv ligger på minst PostCSS 8.5.10; kontrollera med `npm ls postcss` och `npm audit --omit=dev` vid uppgradering.

## PWA

`manifest.ts`, 192/512-ikoner och `public/sw.js` gör appen installerbar. Service workern cachelagrar bara offentligt appskal och använder nätverket först. API-svar, ritualdata och privata sidor läggs inte uttryckligen i offlinecache. Push är avstängt tills VAPID-adaptern är klar.

## Drift på Vercel

1. Importera repot och välj Next.js.
2. Lägg miljövariabler per miljö: Preview och Production ska använda separata Supabase-projekt.
3. Kör migreringar från en kontrollerad CI-jobb, inte från webbruntime.
4. För den kostnadsfria publika demon: behåll `PEPPLY_DEMO_MODE=true` och `NEXT_PUBLIC_DEMO_MODE=true`. Stäng av båda först när Supabase Auth och datalagringen är driftsatta.
5. Deploya och kontrollera `/api/health`.
6. Kör E2E mot preview-domänen.
7. Aktivera schemalagd `public.run_retention_jobs()` först efter juridiskt godkännande av tiderna.
8. Konfigurera backup, återläsningstest, larm och hemlighetsrotation.

## Dokumentation

- [Produkt- och UX-specifikation](docs/PRODUCT.md)
- [Teknisk arkitektur](docs/ARCHITECTURE.md)
- [Säkerhetsmodell](docs/SECURITY.md)
- [AI-evaluering](docs/AI-EVALS.md)
- [Fungerande kontra simulerat](docs/STATUS.md)
- [Lanseringschecklista och öppna beslut](docs/LAUNCH-CHECKLIST.md)

## Juridisk status

Integritetspolicy och villkor i appen är märkta utkast. Pepply berör potentiellt känsliga uppgifter och minderåriga; offentlig lansering kräver dokumenterad GDPR-bedömning, juridiskt fastställda gallringstider och åldersregler, personuppgiftsbiträdesavtal, konsumentvillkor och incidentprocess.
