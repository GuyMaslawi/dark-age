import { describe, it, expect } from "vitest";
import {
  resolveRound,
  aiMove,
  BODY_REGIONS,
  REGION_MODIFIERS,
  BLOCK_DAMAGE_MULTIPLIER,
} from "./tactical";
import type { Combatant } from "./combat";

const strong: Combatant = {
  name: "A",
  strength: 40,
  wisdom: 40,
  agility: 5,
  endurance: 5,
  maxHp: 200,
  weaponBase: 20,
  armorValue: 0,
};

const weak: Combatant = {
  name: "B",
  strength: 2,
  wisdom: 2,
  agility: 2,
  endurance: 2,
  maxHp: 30,
  weaponBase: 1,
  armorValue: 0,
};

describe("resolveRound", () => {
  it("deals damage from A to B and can end the round on a kill", () => {
    const result = resolveRound({
      a: strong,
      b: { ...weak, maxHp: 5 },
      hpA: strong.maxHp,
      hpB: 5,
      round: 1,
      aMove: { strike: "TORSO", guard: "TORSO" },
      bMove: { strike: "TORSO", guard: "LEGS" },
      seed: 12345,
    });
    expect(result.strikes[0]?.actor).toBe("A");
    expect(result.hpB).toBeLessThan(5);
    if (result.hpB <= 0) {
      expect(result.over).toBe(true);
      expect(result.winner).toBe("A");
      expect(result.strikes).toHaveLength(1);
    }
  });

  it("reduces damage when the defender guards the struck region", () => {
    const guarded = resolveRound({
      a: strong,
      b: weak,
      hpA: strong.maxHp,
      hpB: weak.maxHp,
      round: 2,
      aMove: { strike: "TORSO", guard: "TORSO" },
      bMove: { strike: "TORSO", guard: "TORSO" },
      seed: 999,
    });
    const open = resolveRound({
      a: strong,
      b: weak,
      hpA: strong.maxHp,
      hpB: weak.maxHp,
      round: 2,
      aMove: { strike: "TORSO", guard: "TORSO" },
      bMove: { strike: "TORSO", guard: "LEGS" },
      seed: 999,
    });
    const gStrike = guarded.strikes[0]!;
    const oStrike = open.strikes[0]!;
    if (gStrike.outcome !== "MISS" && oStrike.outcome !== "MISS") {
      expect(gStrike.blocked).toBe(true);
      expect(gStrike.damage).toBeLessThan(oStrike.damage);
    }
  });

  it("is deterministic for the same seed and inputs", () => {
    const args = {
      a: strong,
      b: weak,
      hpA: strong.maxHp,
      hpB: weak.maxHp,
      round: 3,
      aMove: { strike: "HEAD" as const, guard: "TORSO" as const },
      bMove: { strike: "LEGS" as const, guard: "HEAD" as const },
      seed: 7,
    };
    expect(resolveRound(args)).toEqual(resolveRound(args));
  });
});

describe("aiMove", () => {
  it("returns valid regions", () => {
    const move = aiMove(42, 1);
    expect(BODY_REGIONS).toContain(move.strike);
    expect(BODY_REGIONS).toContain(move.guard);
  });
});

describe("region modifiers", () => {
  it("head hits harder but less accurately than legs", () => {
    expect(REGION_MODIFIERS.HEAD.damage).toBeGreaterThan(REGION_MODIFIERS.LEGS.damage);
    expect(REGION_MODIFIERS.HEAD.hit).toBeLessThan(REGION_MODIFIERS.LEGS.hit);
    expect(BLOCK_DAMAGE_MULTIPLIER).toBeLessThan(1);
  });
});
