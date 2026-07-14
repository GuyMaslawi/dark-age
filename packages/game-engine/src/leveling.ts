import { MAX_LEVEL } from "./formulas";

export const SUB_LEVELS_PER_LEVEL = 3;
export const POINTS_PER_SUB_LEVEL = 1;
export const POINTS_PER_FULL_LEVEL = 3;

export type Progress = {
  level: number;
  subLevel: number;
  xp: number;
};

export type LevelUpResult = {
  level: number;
  subLevel: number;
  xp: number;
  pointsGained: number;
  levelsGained: number;
  subLevelsGained: number;
};

export function xpToAdvance(level: number): number {
  return Math.round(100 * level * Math.pow(1.12, level - 1));
}

export function isMaxLevel(level: number): boolean {
  return level >= MAX_LEVEL;
}

export function applyXp(current: Progress, gained: number): LevelUpResult {
  let level = current.level;
  let subLevel = current.subLevel;
  let xp = current.xp + Math.max(0, Math.floor(gained));
  let pointsGained = 0;
  let levelsGained = 0;
  let subLevelsGained = 0;

  while (!isMaxLevel(level) && xp >= xpToAdvance(level)) {
    xp -= xpToAdvance(level);
    if (subLevel + 1 >= SUB_LEVELS_PER_LEVEL) {
      level += 1;
      subLevel = 0;
      pointsGained += POINTS_PER_FULL_LEVEL;
      levelsGained += 1;
    } else {
      subLevel += 1;
      pointsGained += POINTS_PER_SUB_LEVEL;
      subLevelsGained += 1;
    }
  }

  if (isMaxLevel(level)) {
    xp = 0;
  }

  return { level, subLevel, xp, pointsGained, levelsGained, subLevelsGained };
}

export type XpProgress = {
  current: number;
  required: number;
  percent: number;
};

export function xpProgress(progress: Progress): XpProgress {
  if (isMaxLevel(progress.level)) {
    return { current: 0, required: 0, percent: 100 };
  }
  const required = xpToAdvance(progress.level);
  const percent = required > 0 ? Math.min(100, Math.round((progress.xp / required) * 100)) : 0;
  return { current: progress.xp, required, percent };
}
