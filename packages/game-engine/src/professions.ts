export type ProfessionKey = "FISHING" | "FARMING" | "MINING";

export type ProfessionConfig = {
  label: string;
  description: string;
  durationMinutes: number;
  energyCost: number;
  baseGold: number;
  goldPerLevel: number;
};

export const PROFESSIONS: Record<ProfessionKey, ProfessionConfig> = {
  FISHING: {
    label: "דיג",
    description: "השלכת חכה אל המים העכורים והמתנה לשלל.",
    durationMinutes: 30,
    energyCost: 8,
    baseGold: 40,
    goldPerLevel: 6,
  },
  FARMING: {
    label: "חקלאות",
    description: "עיבוד האדמה וקציר יבול לאורך שעה.",
    durationMinutes: 60,
    energyCost: 12,
    baseGold: 90,
    goldPerLevel: 10,
  },
  MINING: {
    label: "כרייה",
    description: "חפירה עמוקה במכרות לחילוץ עפרות יקרות.",
    durationMinutes: 90,
    energyCost: 16,
    baseGold: 150,
    goldPerLevel: 16,
  },
};

export const PROFESSION_KEYS = Object.keys(PROFESSIONS) as ProfessionKey[];

export function professionReward(type: ProfessionKey, level: number): number {
  const config = PROFESSIONS[type];
  return config.baseGold + Math.max(0, level - 1) * config.goldPerLevel;
}

export function professionDurationMs(type: ProfessionKey): number {
  return PROFESSIONS[type].durationMinutes * 60_000;
}
