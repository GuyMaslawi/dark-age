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

export const UNARMED_WEAPON_BASE = 3;
export const ENERGY_BATTLE_COST = 6;

export const NPC_SELL_RATE = 0.4;
export const MARKET_FEE_RATE = 0.05;

export function npcSellPrice(basePrice: number): number {
  return Math.max(1, Math.floor(basePrice * NPC_SELL_RATE));
}

export function marketFee(price: number): number {
  return Math.floor(price * MARKET_FEE_RATE);
}

export function marketNetProceeds(price: number): number {
  return Math.max(0, price - marketFee(price));
}

export const CLAN_CREATION_COST = 1000;

export const ENERGY_PVP_COST = 8;
export const PVP_LEVEL_RANGE = 0.2;
export const PVP_PROTECTION_MINUTES = 30;

export function pvpLevelBounds(attackerLevel: number): { low: number; high: number } {
  return {
    low: Math.floor(attackerLevel * (1 - PVP_LEVEL_RANGE)),
    high: Math.ceil(attackerLevel * (1 + PVP_LEVEL_RANGE)),
  };
}

export function withinPvpRange(attackerLevel: number, defenderLevel: number): boolean {
  const { low, high } = pvpLevelBounds(attackerLevel);
  return defenderLevel >= low && defenderLevel <= high;
}

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

export const COMBAT = {
  maxRounds: 30,
  hitBase: 0.8,
  hitPerPoint: 0.012,
  hitFloor: 0.35,
  hitCeil: 0.97,
  strengthDamageCoeff: 1.0,
  enduranceReductionCoeff: 0.25,
  armorReductionCoeff: 0.5,
  damageVariance: 0.15,
  critChance: 0.08,
  critMultiplier: 1.5,
  minDamage: 1,
} as const;

export function hitChance(attackerWisdom: number, defenderAgility: number): number {
  const raw = COMBAT.hitBase + (attackerWisdom - defenderAgility) * COMBAT.hitPerPoint;
  return Math.min(COMBAT.hitCeil, Math.max(COMBAT.hitFloor, raw));
}

export function baseDamage(
  weaponBase: number,
  strength: number,
  defenderEndurance: number,
  defenderArmor: number,
): number {
  const offense = weaponBase + strength * COMBAT.strengthDamageCoeff;
  const defense =
    defenderEndurance * COMBAT.enduranceReductionCoeff +
    defenderArmor * COMBAT.armorReductionCoeff;
  return Math.max(COMBAT.minDamage, offense - defense);
}
