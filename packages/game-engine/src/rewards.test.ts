import { describe, it, expect } from "vitest";
import { pveXpReward, rollGold, rollLoot } from "./rewards";
import { createRng } from "./rng";

describe("pveXpReward", () => {
  it("gives full xp on a win", () => {
    expect(pveXpReward(100, true)).toBe(100);
  });

  it("gives a reduced but positive amount on a loss", () => {
    expect(pveXpReward(100, false)).toBe(25);
    expect(pveXpReward(1, false)).toBe(1);
  });
});

describe("rollGold", () => {
  it("stays within the inclusive range", () => {
    const rng = createRng(5);
    for (let i = 0; i < 500; i += 1) {
      const gold = rollGold(10, 20, rng);
      expect(gold).toBeGreaterThanOrEqual(10);
      expect(gold).toBeLessThanOrEqual(20);
    }
  });

  it("handles a degenerate range", () => {
    expect(rollGold(7, 7, createRng(1))).toBe(7);
  });
});

describe("rollLoot", () => {
  const entries = [
    { itemId: "a", weight: 20 },
    { itemId: "b", weight: 10 },
  ];

  it("returns null when nothing is rolled", () => {
    let drops = 0;
    const rng = createRng(11);
    for (let i = 0; i < 1000; i += 1) {
      if (rollLoot(entries, rng) !== null) {
        drops += 1;
      }
    }
    expect(drops).toBeGreaterThan(0);
    expect(drops).toBeLessThan(1000);
  });

  it("respects the relative weights", () => {
    const rng = createRng(3);
    let countA = 0;
    let countB = 0;
    for (let i = 0; i < 5000; i += 1) {
      const drop = rollLoot(entries, rng);
      if (drop === "a") countA += 1;
      if (drop === "b") countB += 1;
    }
    expect(countA).toBeGreaterThan(countB);
  });
});
