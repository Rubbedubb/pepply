# Pepply – produkt- och UX-specifikation

Version 1.1 · 2026-07-17

## Produktvision

Pepply hjälper människor att avsluta dagen lite lugnare genom en liten personlig handling. Produkten ska inte maximera tid i appen. Det primära framgångsögonblicket är när användaren läser ett enda trovärdigt kvällsmeddelande och sedan lämnar appen med känslan: ”Okej. Nu kan jag sova lite lugnare.”

Kärnlöftet är inte att dagen blir bra eller att problem löses. Löftet är att användaren får en kort, relevant och icke-dömande avslutning på dagen.

## Produktbeslut

1. **Ritual framför feed.** Hem leder till en linjär minut. Efter resultatet finns ingen automatisk nästa rekommendation.
2. **Ett meddelande per ritual.** Regenerering är inte ett belöningshjul. Reservflöde används vid fel.
3. **Lugn före retention.** Streak är diskret, valfri och formulerad som återkomst.
4. **Begränsat AI-minne.** Strukturerade preferenser får leva längre; känslig råtext görs inte automatiskt till profilfakta.
5. **Sekundär chatt.** Chatten har tydligt avslut och paus efter åtta användarturer.
6. **Förhandsmodererat community.** Inga följare, DM eller öppna kommentarer i version 1.
7. **Gratis trygghet.** Krisresurser, rapportering och grundritual låses inte bakom Premium.
8. **Ingen psykologisk annonsriktning.** Annonsmätning innehåller varken användar-ID, mående, fritext eller tema.

## Målgrupper

### Primär: den mentalt fulla kvällsanvändaren

- Ung eller vuxen som är trött efter skola, träning, arbete eller socialt liv.
- Vill känna sig mindre självkritisk eller mindre ensam i en tung dag.
- Har låg ork för långa övningar och vill inte börja ett nytt projekt före sömn.
- Värdesätter modern, rak svenska framför citat och klyschor.

### Sekundär: målanvändaren

- Vill ta små steg i studier, träning, arbete eller relationer.
- Behöver stöd att återvända efter en missad dag utan skuld.

### Särskild omsorg: minderåriga och personer i utsatt läge

- Kräver enklare integritetstext, minimala data, ingen beteendebaserad reklam och tydlig väg till människor/vård.
- Pepply får aldrig utge sig för att vara vård eller ensam hantera akut risk.

## Centrala användarresor

### 1. Första kvällen

1. Landningssidan förklarar ett-minutslöftet.
2. Användaren skapar konto med e-post.
3. Onboarding samlar tilltalsnamn, områden, ton, längd, tid och frivilligt mål.
4. Integritetsrutan förklarar exakt vilket minne som används.
5. Hem visar dagens enda tydliga CTA.
6. Användaren väljer dagsform och skriver högst 600 frivilliga tecken.
7. Säkerhetslager bedömer input före vanlig generering.
8. Ett meddelande visas med spara, dela och enkel feedback.
9. Slutläget säger att användaren är färdig.

Mått: kontoskapande → onboarding → första slutförda ritual, avbrott per steg och hjälpsamhetsbetyg.

### 2. Återkommande kväll

1. Hem anpassas efter om ritualen är ogjord eller färdig.
2. Aktuellt mål visas diskret men tar inte över.
3. Begränsad historik och tidigare feedback används, om användaren tillåter det.
4. Efter ritualen erbjuds ingen feed.

Mått: D1/D7/D30, återkomst efter missad dag, median tid till färdig ritual och andel hjälpsamma meddelanden.

### 3. Tydlig risk

1. Deterministisk klassificering reagerar före AI-generering.
2. Vanligt pepp och gamification tas bort.
3. Svaret är lugnt, direkt och uppmanar till omedelbar mänsklig kontakt.
4. 112, 1177, Mind och åldersrelevant stöd visas.
5. Händelsen loggas som koder utan full råtext.

Mått: 100% bypass för hög-risk-testfall, inga streak/annonser i riskläget, verifierade kontaktresurser.

### 4. Bidra till community

1. Användaren skriver 20–500 tecken, väljer kategori och attribution.
2. Rättighetsbekräftelse krävs.
3. Bidraget hamnar i kö, aldrig direkt offentligt.
4. Moderator ser flaggor och kan godkänna/avslå med auditlogg.

## Informationsarkitektur

| Nivå | Innehåll | Produktroll |
|---|---|---|
| Primär | Hem, ritual | Huvudnytta |
| Sekundär | AI-chatt, Mål, Historik | Reflektion och kontinuitet |
| Kuraterad | Utforska, Bidra | Begränsat innehåll/community |
| Affär | Premium | Frivillig uppgradering |
| Konto | Mitt konto, Inställningar | Kontroll och integritet |
| Drift | Admin | Moderering, säkerhet, kostnad, annonser |

Mobilens bottennavigation visar Hem, Chatt, Mål, Utforska och Mer. Ritualen ligger utanför appskalet för att avlägsna distraktion.

## Prioritering

### P0 – måste fungera före privat beta

- Konto, e-postverifiering och sessionsuppdatering
- Onboarding och samtyckesversion
- Ritual med säkerhet, AI, reservflöde, feedback och lagring
- RLS och behörighetstester
- Dataexport, historikradering och kontoradering
- Grundläggande adminmoderering och auditlogg
- Fel, tomlägen, loading, mörkt läge, tangentbord och reducerad rörelse

### P1 – beta

- Mål och delsteg
- Begränsad AI-chatt
- Historik och sparat
- Kuraterat bibliotek
- Communitykö och rapportering
- Mjuka streaks och märken
- Installerbar PWA

### P2 – efter kvalitetsbevis

- Skarp betalningsadapter
- Web push
- Professionella innehållspartners
- Integritetsvänlig analysdashboard
- Fler språk och native-mobilklient

### Medvetet utanför version 1

- Följare, privata meddelanden, kommentarer
- Oändlig feed
- Diagnostik eller behandlingsplaner
- Emotionellt riktad annonsering
- Realtidschatt med människor

## Designsysten

### Känsla

Minimalistisk, varm och vuxen. Ljus varm bakgrund, gul/orange accent, mörkbrun text och mjuka gröna framgångssignaler. Rundning ska kännas omhändertagande utan att bli barnslig.

### Tokens

| Token | Ljust | Mörkt | Användning |
|---|---|---|---|
| Background | `#FFFDF8` | `#171612` | Sidbakgrund |
| Surface | `#FFFFFF` | `#222019` | Kort/navigation |
| Foreground | `#27251F` | `#F7F1E4` | Primär text |
| Muted | `#6F6A5D` | `#B8B09E` | Sekundär text |
| Brand | `#D97706` | `#F6B94B` | Accent och progress |
| Brand soft | `#FEF3C7` | `#3E3017` | Valda lägen |
| Success | `#417451` | `#81BD8F` | Färdig/positiv status |
| Danger | `#B83D43` | `#FF9296` | Säkerhet/radering |

Typografi: systemnära sans-serif, 16 px bas, 1.5–1.75 radavstånd i lästext, balanserade rubriker och högst cirka 70 tecken per rad. Minsta tryckyta 44×44 px.

### Komponentbeteende

- **Primärknapp:** mörk, rund, en per vy där möjligt.
- **Sekundärknapp:** tunn kant, neutral yta.
- **Kort:** 24–28 px rundning, 20–24 px padding.
- **Valchips:** `aria-pressed`, tydlig färg och ikon, inte bara färg.
- **Formulär:** etikett ovanför, hint under, fel nära fält.
- **Loading:** kort text som beskriver vad som händer; reducerad rörelse respekteras.
- **Tomläge:** förklarar vad som saknas och erbjuder högst en relevant väg.
- **Felläge:** jordnära, ingen skuld, möjlighet att försöka igen.

## Skrivstil

Bra text erkänner svårighet, gör få antaganden och ger högst ett litet perspektiv. Den använder inte utropstecken, stora löften, diagnoser, ödesprat eller formuleringar där AI:n älskar, behöver eller aldrig lämnar användaren.

Exempel: ”Att dagen blev tung betyder inte att du gjorde allt fel. Du behöver inte hitta en vändning i kväll.”

## Framgångsmått och skyddsmått

Primära:

- första ritual slutförd
- D1/D7/D30
- ritualens slutförandegrad och avbrott
- hjälpsamhetsbetyg
- återkomst efter en missad dag
- AI-kostnad per aktiv användare

Skyddsmått:

- rapporterade AI-svar per 1 000 ritualer
- felaktigt missade och felaktigt flaggade säkerhetsfall
- tid till modereringsbeslut
- kontoraderingar/exportfel
- andel användare som stänger av streak eller historik
- tid i appen får inte optimeras upp som egen framgång

## Antaganden

- Första marknaden är Sverige och första språk är svenska.
- Påminnelser är opt-in.
- Standardritualen sker lokalt på användarens kalenderdag i Europe/Stockholm om ingen annan tidszon väljs.
- Premiumpriset 19 kr/mån är ett konfigurerbart riktpris, inte juridiskt fastställt erbjudande.
- Annonsintroduktionspris 250 kr/mån är affärsantagande utanför checkoutflödet.
- Slutliga regler för minderåriga, gallring och säkerhetsgranskning fastställs före offentlig lansering.
