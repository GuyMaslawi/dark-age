import { describe, it, expect } from "vitest";
import {
  applyXp,
  xpToAdvance,
  xpProgress,
  SUB_LEVELS_PER_LEVEL,
} from "./leveling";
import { MAX_LEVEL } from "./formulas";

describe("xpToAdvance", () => {
  it("is 100 at level 1", () => {
    expect(xpToAdvance(1)).toBe(100);
  });

  it("increases monotonically with level", () => {
    for (let level = 1; level < 40; level += 1) {
      expect(xpToAdvance(level + 1)).toBeGreaterThan(xpToAdvance(level));
    }
  });
});

describe("applyXp", () => {
  it("does nothing below the threshold", () => {
    const result = applyXp({ level: 1, subLevel: 0, xp: 0 }, 50);
    expect(result).toMatchObject({ level: 1, subLevel: 0, xp: 50, pointsGained: 0 });
  });

  it("advances one sub-level and grants one point at the threshold", () => {
    const result = applyXp({ level: 1, subLevel: 0, xp: 0 }, xpToAdvance(1));
    expect(result).toMatchObject({
      level: 1,
      subLevel: 1,
      xp: 0,
      pointsGained: 1,
      subLevelsGained: 1,
      levelsGained: 0,
    });
  });

  it("keeps the remainder xp after advancing", () => {
    const result = applyXp({ level: 1, subLevel: 0, xp: 0 }, xpToAdvance(1) + 30);
    expect(result.subLevel).toBe(1);
    expect(result.xp).toBe(30);
  });

  it("grants three points when completing a full level", () => {
    const result = applyXp(
      { level: 1, subLevel: SUB_LEVELS_PER_LEVEL - 1, xp: 0 },
      xpToAdvance(1),
    );
    expect(result).toMatchObject({
      level: 2,
      subLevel: 0,
      pointsGained: 3,
      levelsGained: 1,
    });
  });

  it("accumulates points across several thresholds in one gain", () => {
    const start = { level: 1, subLevel: 0, xp: 0 };
    const needed = xpToAdvance(1) * SUB_LEVELS_PER_LEVEL;
    const result = applyXp(start, needed);
    expect(result.level).toBe(2);
    expect(result.subLevel).toBe(0);
    expect(result.pointsGained).toBe(4 * 1 + 3);
  });

  it("floors fractional xp and ignores negative gains", () => {
    expect(applyXp({ level: 1, subLevel: 0, xp: 0 }, 10.9).xp).toBe(10);
    expect(applyXp({ level: 1, subLevel: 0, xp: 5 }, -100).xp).toBe(5);
  });

  it("stops advancing at the max level", () => {
    const result = applyXp(
      { level: MAX_LEVEL, subLevel: 0, xp: 0 },
      1_000_000_000,
    );
    expect(result.level).toBe(MAX_LEVEL);
    expect(result.xp).toBe(0);
  });
});

describe("xpProgress", () => {
  it("reports percent toward the next sub-level", () => {
    const required = xpToAdvance(3);
    const progress = xpProgress({ level: 3, subLevel: 2, xp: Math.floor(required / 2) });
    expect(progress.required).toBe(required);
    expect(progress.percent).toBe(50);
  });

  it("reports full at max level", () => {
    expect(xpProgress({ level: MAX_LEVEL, subLevel: 0, xp: 0 }).percent).toBe(100);
  });
});
