import { describe, it, expect } from "vitest";
import { runBattle, type Combatant } from "./combat";
import { hitChance, baseDamage, COMBAT } from "./formulas";
import { createRng } from "./rng";

const strong: Combatant = {
  name: "חזק",
  strength: 30,
  wisdom: 25,
  agility: 15,
  endurance: 20,
  maxHp: 300,
  weaponBase: 40,
  armorValue: 20,
};

const weak: Combatant = {
  name: "חלש",
  strength: 5,
  wisdom: 5,
  agility: 5,
  endurance: 5,
  maxHp: 60,
  weaponBase: 4,
  armorValue: 1,
};

describe("hitChance", () => {
  it("is clamped between the floor and ceiling", () => {
    expect(hitChance(100, 0)).toBe(COMBAT.hitCeil);
    expect(hitChance(0, 100)).toBe(COMBAT.hitFloor);
  });

  it("rises when the attacker is wiser than the defender is agile", () => {
    expect(hitChance(20, 10)).toBeGreaterThan(hitChance(10, 20));
  });
});

describe("baseDamage", () => {
  it("never drops below the minimum", () => {
    expect(baseDamage(1, 1, 100, 100)).toBe(COMBAT.minDamage);
  });

  it("increases with weapon and strength, decreases with defense", () => {
    expect(baseDamage(20, 20, 0, 0)).toBeGreaterThan(baseDamage(10, 10, 0, 0));
    expect(baseDamage(20, 20, 0, 0)).toBeGreaterThan(baseDamage(20, 20, 30, 30));
  });
});

describe("runBattle", () => {
  it("is deterministic for a given seed", () => {
    const first = runBattle(strong, weak, createRng(12345));
    const second = runBattle(strong, weak, createRng(12345));
    expect(second).toEqual(first);
  });

  it("produces different logs for different seeds", () => {
    const first = runBattle(strong, weak, createRng(1));
    const second = runBattle(strong, weak, createRng(2));
    expect(second.turns).not.toEqual(first.turns);
  });

  it("lets the stronger combatant win across many seeds", () => {
    let winsForA = 0;
    for (let seed = 1; seed <= 200; seed += 1) {
      if (runBattle(strong, weak, createRng(seed)).winner === "A") {
        winsForA += 1;
      }
    }
    expect(winsForA).toBeGreaterThan(190);
  });

  it("player attacks first each round", () => {
    const outcome = runBattle(strong, weak, createRng(7));
    expect(outcome.turns[0]?.actor).toBe("A");
  });

  it("never exceeds the round cap", () => {
    const mirror: Combatant = { ...strong, name: "מראה" };
    const outcome = runBattle(strong, mirror, createRng(3));
    const lastRound = outcome.turns.at(-1)?.round ?? 0;
    expect(lastRound).toBeLessThanOrEqual(COMBAT.maxRounds);
  });

  it("decides by hp share when the round cap is reached", () => {
    const tanky: Combatant = {
      name: "טנק",
      strength: 1,
      wisdom: 10,
      agility: 10,
      endurance: 50,
      maxHp: 1000,
      weaponBase: 1,
      armorValue: 60,
    };
    const other: Combatant = { ...tanky, name: "אחר", maxHp: 500 };
    const outcome = runBattle(tanky, other, createRng(9));
    const lastRound = outcome.turns.at(-1)?.round ?? 0;
    expect(lastRound).toBe(COMBAT.maxRounds);
    expect(outcome.winner).not.toBe("DRAW");
  });

  it("clamps hp at zero and records the killing blow", () => {
    const outcome = runBattle(strong, weak, createRng(42));
    const last = outcome.turns.at(-1);
    expect(outcome.finalHpB === 0 || outcome.finalHpA === 0).toBe(true);
    expect(last?.hpA).toBeGreaterThanOrEqual(0);
    expect(last?.hpB).toBeGreaterThanOrEqual(0);
  });
});
