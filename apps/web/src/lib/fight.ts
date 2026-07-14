import type {
  Combatant,
  RoundResult,
  StrikeResult,
  BodyRegion,
} from "@kingdom/game-engine";

export type FighterMeta = {
  name: string;
  level: number;
  kind: "character" | "monster";
  avatarKey: string | null;
  gender: "MALE" | "FEMALE" | null;
  slug: string | null;
};

export type FightReward = {
  xpWin: number;
  goldMin: number;
  goldMax: number;
  loot: { itemId: string; weight: number }[];
};

export type FightState = {
  version: 1;
  type: "PVE" | "PVP";
  seed: number;
  round: number;
  a: Combatant;
  b: Combatant;
  hpA: number;
  hpB: number;
  barMaxA: number;
  barMaxB: number;
  aMeta: FighterMeta;
  bMeta: FighterMeta;
  monsterId: string | null;
  defenderId: string | null;
  defenderLevel: number | null;
  reward: FightReward;
  log: RoundResult[];
  over: boolean;
  winner: "A" | "B" | "DRAW" | null;
};

export type FightRewards = {
  won: boolean;
  draw: boolean;
  xpGained: number;
  xpPotential: number;
  goldGained: number;
  lootName: string | null;
  leveledUp: boolean;
  newLevel: number;
};

export type FightView = {
  type: "PVE" | "PVP";
  round: number;
  hpA: number;
  hpB: number;
  barMaxA: number;
  barMaxB: number;
  aMeta: FighterMeta;
  bMeta: FighterMeta;
  log: RoundResult[];
  over: boolean;
  winner: "A" | "B" | "DRAW" | null;
  rewards: FightRewards | null;
};

export function toFightView(state: FightState, rewards: FightRewards | null): FightView {
  return {
    type: state.type,
    round: state.round,
    hpA: state.hpA,
    hpB: state.hpB,
    barMaxA: state.barMaxA,
    barMaxB: state.barMaxB,
    aMeta: state.aMeta,
    bMeta: state.bMeta,
    log: state.log,
    over: state.over,
    winner: state.winner,
    rewards,
  };
}

export const REGION_LABELS: Record<BodyRegion, string> = {
  HEAD: "ראש",
  TORSO: "גוף",
  LEGS: "רגליים",
};

const HIT_LINES = [
  (a: string, d: string, r: string, n: number) => `${a} מנחית מכה ל${r} של ${d} — ${n} נזק.`,
  (a: string, d: string, r: string, n: number) => `${a} פולח את ${r} של ${d} ל-${n} נזק.`,
  (a: string, d: string, r: string, n: number) => `הלהב של ${a} פוגע ב${r} של ${d}: ${n} נזק.`,
];

const CRIT_LINES = [
  (a: string, d: string, r: string, n: number) => `מכה קטלנית! ${a} מרסק את ${r} של ${d} — ${n} נזק!`,
  (a: string, d: string, r: string, n: number) => `פגיעה מושלמת ב${r}! ${d} ספג ${n} נזק אדיר.`,
];

const BLOCK_LINES = [
  (a: string, d: string, r: string, n: number) => `${d} חוסם את המכה ל${r}! רק ${n} נזק עובר.`,
  (a: string, d: string, r: string, n: number) => `${d} צפה את המהלך והגן על ה${r} — ${n} נזק בלבד.`,
];

const MISS_LINES = [
  (a: string, d: string, r: string) => `${a} מכוון ל${r} אך ${d} מתחמק בזריזות.`,
  (a: string, d: string, r: string) => `המכה ל${r} מחטיאה — ${d} נשמט הצידה.`,
];

export function strikeLine(
  attacker: string,
  defender: string,
  strike: StrikeResult,
  seed: number,
): string {
  const region = REGION_LABELS[strike.region];
  const idx = (seed + strike.region.length) >>> 0;
  if (strike.outcome === "MISS") {
    const line = MISS_LINES[idx % MISS_LINES.length]!;
    return line(attacker, defender, region);
  }
  if (strike.outcome === "CRIT") {
    const line = CRIT_LINES[idx % CRIT_LINES.length]!;
    return line(attacker, defender, region, strike.damage);
  }
  if (strike.outcome === "BLOCKED") {
    const line = BLOCK_LINES[idx % BLOCK_LINES.length]!;
    return line(attacker, defender, region, strike.damage);
  }
  const line = HIT_LINES[idx % HIT_LINES.length]!;
  return line(attacker, defender, region, strike.damage);
}
