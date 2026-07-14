import { describe, it, expect } from "vitest";
import { applyRegen } from "./regen";
import { professionReward, professionDurationMs, PROFESSIONS } from "./professions";

describe("applyRegen", () => {
  it("returns unchanged when already at max", () => {
    expect(applyRegen(100, 100, 1_000_000, 1000)).toEqual({ value: 100, consumedMs: 0 });
  });

  it("adds one point per interval and reports consumed time", () => {
    expect(applyRegen(10, 100, 3500, 1000)).toEqual({ value: 13, consumedMs: 3000 });
  });

  it("does not add a point before a full interval elapses", () => {
    expect(applyRegen(10, 100, 900, 1000)).toEqual({ value: 10, consumedMs: 0 });
  });

  it("caps at max and only consumes the time it used", () => {
    const result = applyRegen(98, 100, 10_000, 1000);
    expect(result.value).toBe(100);
    expect(result.consumedMs).toBe(2000);
  });

  it("ignores non-positive elapsed time", () => {
    expect(applyRegen(10, 100, 0, 1000)).toEqual({ value: 10, consumedMs: 0 });
  });
});

describe("professions", () => {
  it("scales gold reward with level", () => {
    expect(professionReward("FISHING", 1)).toBe(PROFESSIONS.FISHING.baseGold);
    expect(professionReward("FISHING", 11)).toBe(
      PROFESSIONS.FISHING.baseGold + 10 * PROFESSIONS.FISHING.goldPerLevel,
    );
  });

  it("converts duration to milliseconds", () => {
    expect(professionDurationMs("MINING")).toBe(90 * 60_000);
  });
});
