import type { Rng } from "./rng";

export const LOSER_XP_SHARE = 0.25;

export function pveXpReward(monsterXp: number, won: boolean): number {
  if (won) {
    return monsterXp;
  }
  return Math.max(1, Math.floor(monsterXp * LOSER_XP_SHARE));
}

export function pvpXpReward(opponentLevel: number, won: boolean): number {
  const base = 15 + opponentLevel * 6;
  if (won) {
    return base;
  }
  return Math.max(1, Math.floor(base * LOSER_XP_SHARE));
}

export function rollGold(min: number, max: number, rng: Rng): number {
  if (max <= min) {
    return Math.max(0, min);
  }
  return min + Math.floor(rng() * (max - min + 1));
}

export type LootEntry = {
  itemId: string;
  weight: number;
};

export function rollLoot(entries: LootEntry[], rng: Rng): string | null {
  const roll = rng() * 100;
  let cumulative = 0;
  for (const entry of entries) {
    cumulative += entry.weight;
    if (roll < cumulative) {
      return entry.itemId;
    }
  }
  return null;
}
