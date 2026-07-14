import { COMBAT, baseDamage, hitChance } from "./formulas";
import { createRng } from "./rng";
import type { Combatant, Side } from "./combat";

export type BodyRegion = "HEAD" | "TORSO" | "LEGS";

export const BODY_REGIONS: BodyRegion[] = ["HEAD", "TORSO", "LEGS"];

export const REGION_MODIFIERS: Record<BodyRegion, { hit: number; damage: number }> = {
  HEAD: { hit: 0.72, damage: 1.6 },
  TORSO: { hit: 1.0, damage: 1.0 },
  LEGS: { hit: 1.18, damage: 0.72 },
};

export const BLOCK_DAMAGE_MULTIPLIER = 0.3;

export type StrikeOutcome = "HIT" | "CRIT" | "BLOCKED" | "MISS";

export type StrikeResult = {
  actor: Side;
  region: BodyRegion;
  guardedRegion: BodyRegion;
  outcome: StrikeOutcome;
  blocked: boolean;
  damage: number;
};

export type RegionMove = {
  strike: BodyRegion;
  guard: BodyRegion;
};

export type RoundResult = {
  round: number;
  strikes: StrikeResult[];
  hpA: number;
  hpB: number;
  over: boolean;
  winner: Side | "DRAW" | null;
};

function clampChance(value: number): number {
  return Math.min(COMBAT.hitCeil, Math.max(COMBAT.hitFloor, value));
}

function resolveStrike(
  actor: Side,
  attacker: Combatant,
  defender: Combatant,
  strike: BodyRegion,
  defenderGuard: BodyRegion,
  rng: () => number,
): StrikeResult {
  const mod = REGION_MODIFIERS[strike];
  const chance = clampChance(hitChance(attacker.wisdom, defender.agility) * mod.hit);
  if (rng() > chance) {
    return {
      actor,
      region: strike,
      guardedRegion: defenderGuard,
      outcome: "MISS",
      blocked: false,
      damage: 0,
    };
  }

  const blocked = defenderGuard === strike;
  const base = baseDamage(
    attacker.weaponBase,
    attacker.strength,
    defender.endurance,
    defender.armorValue,
  );
  const variance = 1 + (rng() * 2 - 1) * COMBAT.damageVariance;
  const crit = !blocked && rng() < COMBAT.critChance;
  let raw = base * mod.damage * variance;
  if (crit) raw *= COMBAT.critMultiplier;
  if (blocked) raw *= BLOCK_DAMAGE_MULTIPLIER;
  const damage = Math.max(COMBAT.minDamage, Math.round(raw));

  return {
    actor,
    region: strike,
    guardedRegion: defenderGuard,
    outcome: blocked ? "BLOCKED" : crit ? "CRIT" : "HIT",
    blocked,
    damage,
  };
}

export function aiMove(seed: number, round: number): RegionMove {
  const rng = createRng((seed ^ (round * 0x9e3779b1)) >>> 0);
  const strike = BODY_REGIONS[Math.floor(rng() * BODY_REGIONS.length)] ?? "TORSO";
  const guard = BODY_REGIONS[Math.floor(rng() * BODY_REGIONS.length)] ?? "TORSO";
  return { strike, guard };
}

export function resolveRound(params: {
  a: Combatant;
  b: Combatant;
  hpA: number;
  hpB: number;
  round: number;
  aMove: RegionMove;
  bMove: RegionMove;
  seed: number;
}): RoundResult {
  const { a, b, aMove, bMove, round, seed } = params;
  const rng = createRng((seed + round * 0x01000193) >>> 0);
  let { hpA, hpB } = params;
  const strikes: StrikeResult[] = [];

  const aStrike = resolveStrike("A", a, b, aMove.strike, bMove.guard, rng);
  hpB = Math.max(0, hpB - aStrike.damage);
  strikes.push(aStrike);

  let over = false;
  let winner: Side | "DRAW" | null = null;

  if (hpB <= 0) {
    over = true;
    winner = "A";
  } else {
    const bStrike = resolveStrike("B", b, a, bMove.strike, aMove.guard, rng);
    hpA = Math.max(0, hpA - bStrike.damage);
    strikes.push(bStrike);
    if (hpA <= 0) {
      over = true;
      winner = "B";
    }
  }

  return { round, strikes, hpA, hpB, over, winner };
}
