import type { Goal, UserPreferences } from "@/lib/types";

export const demoPreferences: UserPreferences = {
  displayName: "Ruben",
  areas: ["studier", "träning", "självkänsla"],
  tone: "lugn och mjuk",
  reminderTime: "21:30",
  remindersEnabled: true,
  messageLength: "kort",
  streaksEnabled: true,
  personalHistoryEnabled: true,
};

export const demoGoals: Goal[] = [
  {
    id: "goal-study",
    title: "Plugga matte 20 minuter",
    description: "Fyra korta pass den här veckan, utan krav på perfektion.",
    category: "studier",
    frequency: "4 gånger per vecka",
    status: "active",
    progress: 50,
    steps: [
      { id: "step-1", title: "Öppna uppgifterna", completed: true },
      { id: "step-2", title: "Gör två tal", completed: true },
      { id: "step-3", title: "Markera det som är svårt", completed: false },
      { id: "step-4", title: "Fråga om en sak", completed: false },
    ],
  },
  {
    id: "goal-sleep",
    title: "Landa före läggdags",
    description: "Lägga undan skärmen efter Pepply tre kvällar.",
    category: "stress",
    frequency: "3 gånger per vecka",
    status: "active",
    progress: 67,
    steps: [
      { id: "step-a", title: "Släck stark belysning", completed: true },
      { id: "step-b", title: "Gör kvällsritualen", completed: true },
      { id: "step-c", title: "Lägg mobilen utom räckhåll", completed: false },
    ],
  },
];

export const professionalMessages = [
  {
    id: "30000000-0000-4000-8000-000000000001",
    category: "självkänsla",
    title: "När du dömer dig själv hårt",
    text: "Det är möjligt att du kunde ha gjort mer. Det betyder inte att det du faktiskt gjorde var värdelöst.",
    author: "Pepplys redaktion",
  },
  {
    id: "30000000-0000-4000-8000-000000000002",
    category: "stress",
    title: "När allt känns olöst",
    text: "Det som hände i dag behöver inte lösas innan du somnar.",
    author: "Pepplys redaktion",
  },
  {
    id: "30000000-0000-4000-8000-000000000003",
    category: "studier",
    title: "När koncentrationen tog slut",
    text: "En trött hjärna är inte ett bevis på dålig disciplin. Pausen kan vara det som gör nästa försök möjligt.",
    author: "Pepplys redaktion",
  },
  {
    id: "30000000-0000-4000-8000-000000000004",
    category: "träning",
    title: "När passet inte blev som tänkt",
    text: "Ett svagt pass raderar inte arbetet du redan lagt ned. Kroppen får ha dagar när den inte svarar som du vill.",
    author: "Pepplys redaktion",
  },
  {
    id: "30000000-0000-4000-8000-000000000005",
    category: "vardagsmotivation",
    title: "Att komma tillbaka",
    text: "Ibland är framsteg bara att komma tillbaka efter att man tappat rytmen.",
    author: "Pepplys redaktion",
  },
  {
    id: "30000000-0000-4000-8000-000000000006",
    category: "relationer",
    title: "När ett samtal stannat kvar",
    text: "Du behöver inte skriva om hela samtalet i huvudet i kväll. Det får vara ofärdigt tills du har mer kraft.",
    author: "Pepplys redaktion",
  },
];

export const weeklyHistory = [
  { day: "Mån", completed: true, mood: "Tung" },
  { day: "Tis", completed: true, mood: "Okej" },
  { day: "Ons", completed: false, mood: null },
  { day: "Tor", completed: true, mood: "Trött" },
  { day: "Fre", completed: true, mood: "Lugn" },
  { day: "Lör", completed: false, mood: null },
  { day: "Sön", completed: true, mood: "Blandad" },
];
