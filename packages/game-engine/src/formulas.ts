export type CoreStats = {
  strength: number;
  wisdom: number;
  agility: number;
  endurance: number;
};

export const STARTING_STATS: CoreStats = {
  strength: 5,
  wisdom: 5,
  agility: 5,
  endurance: 5,
};

export const STARTING_POINTS = 5;
export const STARTING_GOLD = 50;

export const MAX_LEVEL = 60;

const BASE_HP = 60;
const HP_PER_ENDURANCE = 8;
const HP_PER_LEVEL = 6;

const BASE_ENERGY = 100;
const ENERGY_PER_LEVEL = 2;

export function maxHpFor(endurance: number, level: number): number {
  return BASE_HP + endurance * HP_PER_ENDURANCE + level * HP_PER_LEVEL;
}

export function maxEnergyFor(level: number): number {
  return BASE_ENERGY + (level - 1) * ENERGY_PER_LEVEL;
}

export const STAT_KEYS = [
  "strength",
  "wisdom",
  "agility",
  "endurance",
] as const;

export type StatKey = (typeof STAT_KEYS)[number];
