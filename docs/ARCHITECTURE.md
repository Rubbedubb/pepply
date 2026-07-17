# Teknisk arkitektur

## Överblick

```mermaid
flowchart TD
  Browser[Next.js PWA] --> Routes[Route Handlers]
  Routes --> DAL[Auth + Data Access]
  DAL --> DB[(Supabase Postgres + RLS)]
  Routes --> Safety[Deterministiskt säkerhetslager]
  Safety -->|normal| AI[Utbytbart AI-lager]
  Safety -->|risk| Crisis[Granskat krisflöde]
  AI --> Cloudflare[Cloudflare Workers AI Free]
  AI --> Fallback[Granskade reservtexter]
```

Klienten får aldrig hemliga nycklar eller systemprompt. Route Handlers validerar input, verifierar användare/roll, rate-limit:ar och returnerar minsta nödvändiga DTO. PostgreSQL/RLS är sista dataförsvar även om ett routefel skulle uppstå.

## Lager

| Lager | Plats | Ansvar |
|---|---|---|
| Presentation | `src/app`, `src/components` | Routing, tillgänglig UI, responsivitet |
| API/BFF | `src/app/api` | Validering, auth, orkestrering, DTO |
| Domän | `src/lib/ai`, `safety`, `validation` | Ritualregler, prompts, säkerhet, fallback |
| DAL/Auth | `src/lib/auth`, `supabase` | Session, roll, klienter, datagräns |
| Data | `supabase/migrations` | Relationer, index, RLS, retention |
| Drift | Vercel + Supabase | Miljöer, logg, backup, schemalagda jobb |

## Viktiga dataflöden

### Ritual

1. Klienten skickar mood, frivillig note, ton, längd, områden, eventuellt mål och högst fem korta nyliga meddelanden.
2. Zod avvisar överstora eller ogiltiga fält.
3. Servern verifierar användaren.
4. Deterministisk säkerhetsklassificering körs före kvot och AI.
5. Vid risk returneras granskat svar och resurser; vanlig AI och AI-kvot bypassas.
6. Vid normal input förbrukas en gemensam gräns på högst tre AI-försök per användare och dygn.
7. Annars används Cloudflare Workers AI Free eller en granskad reservtext vid dagsgräns, leverantörsfel, fri Cloudflare-kvot eller saknad konfiguration.
8. Utdata valideras mot längd, diagnos, falsk säkerhet och beroendespråk.
9. Check-in, ritual, meddelande och tokenmetadata sparas under användarens RLS.
10. Klienten markerar kvällen färdig och visar inget nästa innehåll.

### AI-chatt

Högst sex tidigare meddelanden hämtas och åtta användarturer tillåts i klienten. Chatten delar den dagliga AI-gränsen med ritualen och går över till reservtext utan fel när gränsen nås. Råtext är markerad för 30 dagars standardgallring. Ingen chatttext omvandlas automatiskt till mål eller permanent minne.

### Adminmoderering

`/admin` gör en serverkontroll av moderator/admin. Beslut uppdaterar bidrag, publicerar godkänd text och skapar auditlogg. RLS upprepar rollkontrollen i databasen.

## API-yta

| Metod | Route | Skydd | Funktion |
|---|---|---|---|
| GET | `/api/health` | Publik, inga hemligheter | Integrationsstatus |
| POST | `/api/onboarding` | Inloggad | Profil, preferenser, samtycke |
| POST | `/api/rituals/generate` | Inloggad + rate limit | Säker ritualgenerering |
| POST | `/api/chat` | Inloggad + rate limit | Begränsad reflektionschatt |
| GET/POST | `/api/goals` | Inloggad | Mål |
| PATCH | `/api/goals/[goalId]/steps/[stepId]` | Inloggad + ägarskap | Delsteg |
| POST | `/api/feedback` | Inloggad | Hjälpsamhetsbetyg |
| POST | `/api/community` | Inloggad + rate limit | Modereringskö |
| GET | `/api/library` | Inloggad | Kuraterat publicerat innehåll |
| GET/POST/DELETE | `/api/saved` | Inloggad + ägarskap | Favoriter |
| POST | `/api/reports` | Inloggad + rate limit | Rapport + modereringsärende |
| PATCH | `/api/admin/moderation/[id]` | Moderator/admin | Beslut + audit |
| PATCH | `/api/settings` | Inloggad | Preferenser |
| GET | `/api/account/export` | Inloggad | JSON-export |
| DELETE | `/api/account/history` | Inloggad + fras | Historikradering |
| DELETE | `/api/account/delete` | Inloggad + fras | Kontoradering |
| POST | `/api/ads/*` | Inloggad | Icke-personliga event |
| POST | `/api/billing/checkout` | Inloggad | Adapterstub, avstängd |

## Databas

Migreringarna innehåller samtliga efterfrågade datatyper plus `user_roles`, `user_achievements`, `professional_messages`, `feature_flags` och `rate_limits`. FK med `ON DELETE CASCADE` gör kontoradering heltäckande. Index följer användar-/tidsfrågor, köer och aktiva annonser. Serverägda triggers uppdaterar streak och milstolpar när ritualer eller målsteg slutförs; klienten har bara läsrätt till dessa belöningar.

Känsliga fält:

- `check_ins.note`
- `ai_conversation_messages.content`
- målets privata anteckningar
- safety events (kodad, ingen råtext)
- samtyckes- och auditloggar

## Miljöer och drift

- **Development:** lokalt demo eller separat Supabase dev.
- **Preview/Test:** separat Supabase, testnyckel och testmodell/kvot.
- **Production:** EU-region, demo av, schemalagd retention, backup och larm.

Databasmigreringar körs i CI med kontrollerad roll. Webbruntime får inte schemaändringsbehörighet. Service-role-nyckel används endast i få servermoduler och får aldrig loggas eller exponeras.

## Framtida mobilapp

Domän, validering, databas och API är separerade från React-komponenterna. En native-klient kan återanvända samma API-kontrakt. PWA är första klient för att validera ritualen innan kostnaden för dubbla klienter tas.
