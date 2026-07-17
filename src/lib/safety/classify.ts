import type { SafetyLevel } from "@/lib/types";

const concernPatterns = [
  /\bsjälvmord\b/i,
  /\bsuicid/i,
  /\bta livet av (mig|mej)\b/i,
  /\bta mitt (eget )?liv\b/i,
  /\b(vill|orkar)( jag)? inte leva(?=$|[\s.,!?;:])/iu,
  /\b(vill|önskar) (att jag vore|vara) död(?=$|[\s.,!?;:])/iu,
  /\b(vill jag|jag vill) inte dö(?=$|[\s.,!?;:])/iu,
  /\b(vill|ska|tänker) (skada|göra illa) (mig|mej)\b/i,
  /\bskär(a|er|t) (mig|mej)\b/i,
  /\bförsvinna för alltid\b/i,
];

const intentPatterns = [
  /\bjag (ska|kommer|tänker) (ta livet av|döda|skada|göra illa) (mig|mej)\b/i,
  /\bjag (ska|kommer|tänker) ta mitt (eget )?liv\b/i,
  /\bjag har (en )?(konkret )?plan\b/i,
  /\bjag har bestämt (mig|mej)\b/i,
  /\b(i kväll|ikväll|i natt|inatt|nu|snart)\b/i,
  /\bhar (tagit|svalt|förberett|skrivit ett avskedsbrev)\b/i,
];

const clearNegations = [
  /\bjag vill inte (dö|skada mig|ta livet av mig)(?=$|[\s.,!?;:])/iu,
  /\bjag tänker inte (skada mig|ta livet av mig)\b/i,
  /\bjag har inga (självmordstankar|planer)\b/i,
];

export interface SafetyAssessment {
  level: SafetyLevel;
  reasons: string[];
  shouldBypassGeneration: boolean;
}

export function classifySafety(text: string): SafetyAssessment {
  const normalized = text.normalize("NFKC").replace(/\s+/g, " ").trim();
  const concernHits = concernPatterns.filter((pattern) =>
    pattern.test(normalized),
  );

  if (concernHits.length === 0) {
    return { level: "none", reasons: [], shouldBypassGeneration: false };
  }

  const negated = clearNegations.some((pattern) => pattern.test(normalized));
  const intentHits = intentPatterns.filter((pattern) => pattern.test(normalized));
  const urgent = !negated && intentHits.length >= 1;

  return {
    level: urgent ? "urgent" : "concern",
    reasons: [
      "self_harm_language",
      ...(urgent ? ["possible_immediacy_or_plan"] : []),
      ...(negated ? ["explicit_negation_detected"] : []),
    ],
    shouldBypassGeneration: urgent,
  };
}

const disallowedOutputPatterns = [
  /jag (älskar|behöver|saknar) dig/i,
  /jag lämnar dig aldrig/i,
  /allt (kommer|ska) bli (bra|perfekt)/i,
  /du kan klara (precis )?allt/i,
  /universum har/i,
  /allting händer av en anledning/i,
  /du (har|lider av) (depression|ångest|ocd|adhd)/i,
  /sluta (ta|med) din medicin/i,
];

export function validateGeneratedMessage(message: string): {
  safe: boolean;
  reason?: string;
} {
  if (message.trim().length < 30 || message.length > 900) {
    return { safe: false, reason: "length_out_of_bounds" };
  }

  const hit = disallowedOutputPatterns.find((pattern) => pattern.test(message));
  return hit
    ? { safe: false, reason: "disallowed_style_or_claim" }
    : { safe: true };
}
