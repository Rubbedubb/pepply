import type { CrisisResource } from "@/lib/types";

/**
 * Verified 2026-07-17 against 1177.se and mind.se.
 * Review at least quarterly and before every public launch.
 */
export const SWEDISH_CRISIS_RESOURCES: CrisisResource[] = [
  {
    label: "Akut fara",
    value: "Ring 112",
    href: "tel:112",
    description:
      "Om situationen känns outhärdlig eller om du har planer att skada dig själv eller ta ditt liv.",
  },
  {
    label: "Sjukvårdsrådgivning",
    value: "Ring 1177",
    href: "tel:1177",
    description: "För råd om var du kan söka vård.",
  },
  {
    label: "Mind Självmordslinjen",
    value: "Ring 90 101 eller chatta",
    href: "https://mind.se/fa-hjalp/sjalvmordslinjen/",
    description: "Anonymt medmänskligt stöd. Aktuella tider finns på mind.se.",
  },
  {
    label: "Bris, för dig under 18",
    value: "Ring eller sms:a 116 111",
    href: "https://www.bris.se/for-barn-och-unga/prata-med-oss/",
    description: "Stöd från en kurator via telefon, sms eller chatt.",
  },
];
