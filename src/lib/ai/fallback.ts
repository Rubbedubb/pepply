import type { GeneratedPepp, RitualInput } from "@/lib/types";
import { RITUAL_PROMPT_VERSION } from "@/lib/ai/prompts";

const messagesByMood: Record<string, string> = {
  Tung: "Att dagen blev tung betyder inte att du gjorde allt fel. Du behöver inte hitta en lärdom eller vändning i kväll. Det räcker att du låter dagen sluta och tar nästa sak när du har mer kraft.",
  Trött: "Du får vara trött utan att göra tröttheten till ett bevis på att du är svag. Det som återstår kan vänta tills hjärnan och kroppen fått en chans att landa.",
  Stressad: "Du behöver inte hålla alla morgondagens uppgifter i huvudet samtidigt. Välj en sak att minnas, skriv ned den om du vill, och låt resten vänta utanför den här kvällen.",
  Okej: "En dag behöver inte vara särskilt bra eller särskilt dålig för att få ta slut. Det du hann med får vara nog för i dag, även om några saker blev kvar.",
  Lugn: "Låt lugnet få vara enkelt. Du behöver inte använda det till att planera, förbättra eller hinna ikapp. Du kan bara låta dagen vara färdig.",
  Blandad: "Flera saker kan vara sanna samtidigt: något kan ha varit fint och något annat tungt. Du behöver inte bestämma vilken känsla som vann innan du somnar.",
};

export function getFallbackPepp(input: RitualInput): GeneratedPepp {
  const areaFallback =
    input.areas[0] === "studier"
      ? "Det du inte förstod i dag är inte ett slutgiltigt mått på vad du kan lära dig. Ett nytt försök får börja litet och behöver inte ske i kväll."
      : input.areas[0] === "träning"
        ? "Ett pass eller en dag säger mindre om din utveckling än det känns som just nu. Kroppen får vara ojämn. Återhämtning är också en del av arbetet."
        : "Det som hände i dag behöver inte lösas innan du somnar. Du får låta något vara ofärdigt utan att det betyder att du gett upp.";

  return {
    message: messagesByMood[input.mood] ?? areaFallback,
    closing: "Det räcker för i kväll. Ta hand om dig.",
    source: "fallback",
    promptVersion: RITUAL_PROMPT_VERSION,
    safetyLevel: "none",
  };
}

export function getFallbackChatReply(turnCount: number): string {
  return turnCount >= 4
    ? "Det låter som att du redan har ringat in vad som tar mest plats. Välj gärna ett litet nästa steg, skriv ned det och låt samtalet sluta där för stunden."
    : "Vi kan göra det mindre. Vad är den enda del av situationen som känns viktigast att reda ut just nu?";
}
