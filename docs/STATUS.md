# Implementationsstatus

Ingen funktion ska beskrivas som färdig om den kräver en adapter eller extern konfiguration som inte finns.

## Fullt implementerat i repot

| Område | Status | Kommentar |
|---|---|---|
| Responsivt designsystem | Fungerar | Ljust/mörkt, reducerad rörelse, fokus, mobilnav |
| Landningssida | Fungerar | Produktlöfte och demoingång |
| Onboarding | Fungerar | 4 steg, validerad API-lagring i Supabase |
| Kvällsritual | Fungerar | Ett svar, feedback, spara/dela, tydligt slut |
| AI-abstraktion | Fungerar | OpenAI-adapter + leverantörsoberoende interface |
| AI-reservflöde | Fungerar | Granskade svenska meddelanden utan extern tjänst |
| Säkerhetsflöde | Fungerar tekniskt | Pre-check, bypass, resurser, kodad logg; klinisk granskning återstår |
| Begränsad AI-chatt | Fungerar | Konversationsgräns, sammanfattningssignal, safety |
| Mål | Fungerar | Serverhämtning, skapande, första delsteg och beständig avprickning |
| Historik/sparat | Fungerar | Serverstatistik, sju dagar, målprogress, flera typer av sparade meddelanden |
| Utforska | Fungerar | Databasdrivet, begränsat kuraterat bibliotek, filter och favoriter |
| Communitybidrag | Fungerar | Validering, automatisk flaggning, manuell kö, rättighetsbekräftelse |
| Adminmoderering | Fungerar | Verklig kö, rollskydd, beslut, publicering, ärende och audit |
| Inställningar/data | Fungerar | Databasvärden, tema, cookieval, export, historikradering |
| Kontoradering | Fungerar | UI-bekräftelse + permanent Supabase Auth-radering och FK-cascade |
| Databas/RLS | Fungerar som migration | Schema, policyer, index, retention, streak-/milstolpstriggers |
| PWA | Fungerar | Manifest, ikoner, service worker, offlinevy |
| Enhetstest/build | Fungerar | 23 tester, lint, strikt TypeScript och produktionsbuild godkända |

## Integrationsklara men kräver nycklar/drift

| Område | Vad som krävs |
|---|---|
| Riktig e-postinloggning | Supabase-projekt, SMTP/leverans, redirect-URL, anti-abuse |
| AI-generering | `OPENAI_API_KEY`, budget, evalgodkännande och produktionsmodell |
| Datapersistens | Migreringar, seed och Supabase-env |
| Felövervakning | Leverantör, redaction, larm och incidentägare |
| Analytics | Samtycke, dataskyddsgranskning och händelseschema |

## Avsiktligt simulerat/inte skarpt

| Område | Nuvarande läge | För att slutföra |
|---|---|---|
| Premiumbetalning | CTA når adapterroute som svarar 501 | Implementera Stripe-provider, signerad webhook, portal, konsumentvillkor, tester |
| Pushnotiser | Manifest/PWA förberett | VAPID-prenumeration, lagring, cron/queue, opt-in-test |
| Annonsuppladdning | Schema, seedbanner och adminöversikt | Objektlagring, bildmoderering, kampanj-CRUD, fakturering |
| Adminanalys | Realistisk demo-data | Integritetsgranskade aggregeringsvyer/ETL |
| Prompteditor | Versionstabell och aktiv versionsindikering | Dual approval, diff, canary och rollback-UI |
| Social login | Arkitekturen tillåter | Konfigurera providers och konto-länkning |
| Fler språk | Localefält finns | Översättning, separata safety/eval-dataset och resurser |

## Kända leveransbegränsningar

- Den bifogade appen har inte tillgång till mottagarens Supabase-, OpenAI-, betalnings- eller pushnycklar.
- Databasmigreringarna är syntax- och arkitekturgranskade men har inte körts mot ett faktiskt Supabase-projekt i denna miljö.
- Playwright-sviten med 13 scenarier kunde inte köra browsern här på grund av sandlådans nätverksinterfacebegränsning. Den ingår och ska köras i normal CI.
- Juridiska sidor är uttryckligen utkast.
- Säkerhetsklassificering är en teknisk skyddsmekanism och kräver extern klinisk/säkerhetsmässig validering.
- `npm audit --omit=dev` rapporterar 0 kända sårbarheter. En explicit PostCSS-override hålls kvar tills Next.js själv kräver en patchad version.
