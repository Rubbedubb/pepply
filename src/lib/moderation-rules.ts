const localRules: Array<{ flag: string; pattern: RegExp }> = [
  {
    flag: "possible_personal_data",
    pattern: /\b[\w.+-]+@[\w.-]+\.[a-z]{2,}\b|\b(?:\+46|0)7\d(?:[ -]?\d){7}\b/i,
  },
  {
    flag: "possible_advertising",
    pattern: /https?:\/\/|www\.|rabattkod|köp nu|sponsrad/i,
  },
  {
    flag: "medical_claim",
    pattern: /\bdu har (?:depression|adhd|ångestsyndrom)|botar|garanterad behandling\b/i,
  },
  {
    flag: "unsafe_promise",
    pattern: /allt (?:kommer|blir) (?:säkert )?bra|jag lovar|du kan klara allt/i,
  },
  {
    flag: "possible_self_harm_instruction",
    pattern: /så (?:skadar|dödar) du dig|instruktion(?:er)? för självmord|bästa sättet att dö/i,
  },
  {
    flag: "possible_harassment",
    pattern: /\b(?:idiot|värdelös|äcklig|hora)\b/i,
  },
];

export function getLocalModerationFlags(text: string): string[] {
  return localRules
    .filter((rule) => rule.pattern.test(text))
    .map((rule) => rule.flag);
}
