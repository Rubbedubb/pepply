export const supportAreas = [
  "självkänsla",
  "studier",
  "träning",
  "arbete",
  "relationer",
  "stress",
  "vardagsmotivation",
] as const;

export const toneOptions = [
  "lugn och mjuk",
  "rak och ärlig",
  "energisk",
  "eftertänksam",
  "humoristisk men respektfull",
] as const;

export const aiModes = ["direct", "advanced"] as const;

export type SupportArea = (typeof supportAreas)[number];
export type ToneOption = (typeof toneOptions)[number];
export type AiMode = (typeof aiModes)[number];
export type MessageLength = "kort" | "utvecklad";
export type UserRole = "user" | "moderator" | "admin";
export type SafetyLevel = "none" | "concern" | "urgent";

export interface UserPreferences {
  displayName: string;
  areas: SupportArea[];
  tone: ToneOption;
  reminderTime: string;
  remindersEnabled: boolean;
  messageLength: MessageLength;
  streaksEnabled: boolean;
  personalHistoryEnabled: boolean;
}

export interface Goal {
  id: string;
  title: string;
  description?: string;
  category: SupportArea;
  frequency?: string;
  status: "active" | "paused" | "completed";
  progress: number;
  steps: Array<{ id: string; title: string; completed: boolean }>;
}

export interface RitualInput {
  mood: string;
  note?: string;
  question: string;
  tone: ToneOption;
  length: MessageLength;
  areas: SupportArea[];
  activeGoal?: string;
  recentMessages?: string[];
  recentFeedback?: Array<{ message: string; helpful: boolean }>;
}

export interface GeneratedPepp {
  message: string;
  closing: string;
  source: "ai" | "fallback" | "professional";
  promptVersion: string;
  safetyLevel: SafetyLevel;
}

export interface CrisisResource {
  label: string;
  value: string;
  href: string;
  description: string;
}
