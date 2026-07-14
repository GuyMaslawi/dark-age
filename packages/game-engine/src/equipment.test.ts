import { describe, it, expect } from "vitest";
import { aggregateEquipment, effectiveStats, EMPTY_BONUS } from "./equipment";
import { UNARMED_WEAPON_BASE } from "./formulas";

const sword = { ...EMPTY_BONUS, strength: 3, weaponBase: 12 };
const shield = { ...EMPTY_BONUS, endurance: 3, armorValue: 7 };
const ring = { ...EMPTY_BONUS, wisdom: 3, agility: 4 };

describe("aggregateEquipment", () => {
  it("returns zeros for no equipment", () => {
    expect(aggregateEquipment([])).toEqual(EMPTY_BONUS);
  });

  it("sums all bonus fields across pieces", () => {
    const total = aggregateEquipment([sword, shield, ring]);
    expect(total).toEqual({
      strength: 3,
      wisdom: 3,
      agility: 4,
      endurance: 3,
      weaponBase: 12,
      armorValue: 7,
    });
  });
});

describe("effectiveStats", () => {
  const base = { strength: 10, wisdom: 10, agility: 10, endurance: 10 };

  it("adds unarmed base weapon when no weapon is equipped", () => {
    const stats = effectiveStats(base, EMPTY_BONUS);
    expect(stats.weaponBase).toBe(UNARMED_WEAPON_BASE);
    expect(stats.armorValue).toBe(0);
  });

  it("applies equipment bonuses on top of base stats", () => {
    const stats = effectiveStats(base, aggregateEquipment([sword, shield, ring]));
    expect(stats.strength).toBe(13);
    expect(stats.endurance).toBe(13);
    expect(stats.weaponBase).toBe(UNARMED_WEAPON_BASE + 12);
    expect(stats.armorValue).toBe(7);
  });
});
