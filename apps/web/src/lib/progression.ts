import type { Character, Prisma } from "@kingdom/db";
import { applyXp, maxEnergyFor, maxHpFor } from "@kingdom/game-engine";

export type RewardInput = {
  xpGained: number;
  goldGained: number;
  won: boolean;
  draw: boolean;
  isPvp: boolean;
  postBattleHp: number;
};

export type CharacterUpdate = {
  data: Prisma.CharacterUpdateInput;
  leveledUp: boolean;
  newLevel: number;
};

export function computeCharacterUpdate(
  character: Character,
  reward: RewardInput,
): CharacterUpdate {
  const progress = applyXp(
    { level: character.level, subLevel: character.subLevel, xp: character.xp },
    reward.xpGained,
  );
  const leveledUp = progress.levelsGained > 0;

  const data: Prisma.CharacterUpdateInput = {
    xp: progress.xp,
    level: progress.level,
    subLevel: progress.subLevel,
    unspentPoints: { increment: progress.pointsGained },
    gold: { increment: reward.goldGained },
  };

  if (leveledUp) {
    const newMaxHp = maxHpFor(character.endurance, progress.level);
    data.maxHp = newMaxHp;
    data.maxEnergy = maxEnergyFor(progress.level);
    data.hp = newMaxHp;
  } else {
    data.hp = Math.max(1, Math.min(reward.postBattleHp, character.maxHp));
  }

  if (reward.isPvp) {
    if (reward.won) {
      data.pvpWins = { increment: 1 };
    } else if (!reward.draw) {
      data.pvpLosses = { increment: 1 };
    }
  } else if (reward.won) {
    data.pveWins = { increment: 1 };
  }

  return { data, leveledUp, newLevel: progress.level };
}
