import { COMBAT, baseDamage, hitChance } from "./formulas";
import type { Rng } from "./rng";

export type Combatant = {
  name: string;
  strength: number;
  wisdom: number;
  agility: number;
  endurance: number;
  maxHp: number;
  weaponBase: number;
  armorValue: number;
};

export type Side = "A" | "B";

export type BattleTurn = {
  round: number;
  actor: Side;
  hit: boolean;
  crit: boolean;
  damage: number;
  hpA: number;
  hpB: number;
};

export type BattleOutcome = {
  winner: Side | "DRAW";
  turns: BattleTurn[];
  finalHpA: number;
  finalHpB: number;
};

function resolveAttack(
  attacker: Combatant,
  defender: Combatant,
  rng: Rng,
): { hit: boolean; crit: boolean; damage: number } {
  const chance = hitChance(attacker.wisdom, defender.agility);
  if (rng() > chance) {
    return { hit: false, crit: false, damage: 0 };
  }
  const base = baseDamage(
    attacker.weaponBase,
    attacker.strength,
    defender.endurance,
    defender.armorValue,
  );
  const variance = 1 + (rng() * 2 - 1) * COMBAT.damageVariance;
  const crit = rng() < COMBAT.critChance;
  const multiplier = crit ? COMBAT.critMultiplier : 1;
  const damage = Math.max(COMBAT.minDamage, Math.round(base * variance * multiplier));
  return { hit: true, crit, damage };
}

export function runBattle(a: Combatant, b: Combatant, rng: Rng): BattleOutcome {
  let hpA = a.maxHp;
  let hpB = b.maxHp;
  const turns: BattleTurn[] = [];

  for (let round = 1; round <= COMBAT.maxRounds; round += 1) {
    const attackA = resolveAttack(a, b, rng);
    hpB = Math.max(0, hpB - attackA.damage);
    turns.push({ round, actor: "A", hit: attackA.hit, crit: attackA.crit, damage: attackA.damage, hpA, hpB });
    if (hpB <= 0) {
      break;
    }

    const attackB = resolveAttack(b, a, rng);
    hpA = Math.max(0, hpA - attackB.damage);
    turns.push({ round, actor: "B", hit: attackB.hit, crit: attackB.crit, damage: attackB.damage, hpA, hpB });
    if (hpA <= 0) {
      break;
    }
  }

  let winner: Side | "DRAW";
  if (hpA <= 0 && hpB <= 0) {
    winner = "DRAW";
  } else if (hpB <= 0) {
    winner = "A";
  } else if (hpA <= 0) {
    winner = "B";
  } else {
    const shareA = hpA / a.maxHp;
    const shareB = hpB / b.maxHp;
    winner = shareA > shareB ? "A" : shareB > shareA ? "B" : "DRAW";
  }

  return { winner, turns, finalHpA: hpA, finalHpB: hpB };
}
