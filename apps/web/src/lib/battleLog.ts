import type { BattleTurn } from "@kingdom/game-engine";

export type BattleLogFighter = {
  name: string;
  startHp: number;
  avatarKey: string | null;
  gender: "MALE" | "FEMALE" | null;
  level: number;
  kind: "character" | "monster";
};

export type BattleRewards = {
  won: boolean;
  draw: boolean;
  xpGained: number;
  goldGained: number;
  leveledUp: boolean;
  newLevel: number;
  lootName: string | null;
};

export type BattleLogData = {
  version: 1;
  attacker: BattleLogFighter;
  defender: BattleLogFighter;
  turns: BattleTurn[];
  winner: "A" | "B" | "DRAW";
  finalHpA: number;
  finalHpB: number;
  rewards: BattleRewards;
};
