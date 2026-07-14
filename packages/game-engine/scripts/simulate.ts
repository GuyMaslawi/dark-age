import {
  runBattle,
  createRng,
  maxHpFor,
  UNARMED_WEAPON_BASE,
  POINTS_PER_SUB_LEVEL,
  POINTS_PER_FULL_LEVEL,
  SUB_LEVELS_PER_LEVEL,
  STARTING_POINTS,
  type Combatant,
} from "../src/index";

const POINTS_PER_LEVEL =
  (SUB_LEVELS_PER_LEVEL - 1) * POINTS_PER_SUB_LEVEL + POINTS_PER_FULL_LEVEL;

function pointsAtLevel(level: number): number {
  return STARTING_POINTS + (level - 1) * POINTS_PER_LEVEL;
}

type Build = "balanced" | "warrior" | "guardian";

function statsForLevel(level: number, build: Build) {
  const points = pointsAtLevel(level);
  const base = { strength: 5, wisdom: 5, agility: 5, endurance: 5 };
  const weights: Record<Build, [number, number, number, number]> = {
    balanced: [1, 1, 1, 1],
    warrior: [2, 1, 1, 1],
    guardian: [1, 1, 1, 2],
  };
  const [ws, ww, wa, we] = weights[build];
  const total = ws + ww + wa + we;
  base.strength += Math.round((points * ws) / total);
  base.wisdom += Math.round((points * ww) / total);
  base.agility += Math.round((points * wa) / total);
  base.endurance += Math.round((points * we) / total);
  return base;
}

function fighter(level: number, build: Build): Combatant {
  const stats = statsForLevel(level, build);
  return {
    name: `L${level}-${build}`,
    ...stats,
    maxHp: maxHpFor(stats.endurance, level),
    weaponBase: UNARMED_WEAPON_BASE + level,
    armorValue: Math.floor(level / 2),
  };
}

function winRate(a: Combatant, b: Combatant, runs: number, seedOffset: number): number {
  let winsA = 0;
  for (let i = 0; i < runs; i += 1) {
    const outcome = runBattle(a, b, createRng(seedOffset + i));
    if (outcome.winner === "A") winsA += 1;
  }
  return winsA / runs;
}

function pct(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

function main(): void {
  const runsPerMatchup = 2000;
  let totalBattles = 0;
  let seed = 1;

  console.log("=== Kingdom RPG battle balance simulation ===\n");

  console.log("Mirror matches (attacker win-rate, expect ~50%):");
  for (const level of [5, 15, 30, 50]) {
    const rate = winRate(fighter(level, "balanced"), fighter(level, "balanced"), runsPerMatchup, seed);
    seed += runsPerMatchup;
    totalBattles += runsPerMatchup;
    console.log(`  level ${level} vs ${level}: attacker ${pct(rate)}`);
  }

  console.log("\nLevel gap within PvP range (higher-level attacker win-rate):");
  for (const level of [12, 25, 40]) {
    for (const gap of [1, 3, 6]) {
      const rate = winRate(
        fighter(level, "balanced"),
        fighter(level - gap, "balanced"),
        runsPerMatchup,
        seed,
      );
      seed += runsPerMatchup;
      totalBattles += runsPerMatchup;
      console.log(`  level ${level} vs ${level - gap}: attacker ${pct(rate)}`);
    }
  }

  console.log("\nBuild matchups at level 30 (attacker win-rate):");
  const builds: Build[] = ["balanced", "warrior", "guardian"];
  for (const a of builds) {
    for (const b of builds) {
      if (a === b) continue;
      const rate = winRate(fighter(30, a), fighter(30, b), runsPerMatchup, seed);
      seed += runsPerMatchup;
      totalBattles += runsPerMatchup;
      console.log(`  ${a} vs ${b}: attacker ${pct(rate)}`);
    }
  }

  console.log(`\nTotal battles simulated: ${totalBattles}`);
}

main();
