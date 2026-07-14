import { describe, it, expect } from "vitest";
import {
  aggregateEquipment,
  effectiveStats,
  EMPTY_BONUS,
  deriveItemRequirements,
  checkItemRequirements,
  type ItemLike,
} from "./equipment";
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

const swordItem: ItemLike = {
  type: "WEAPON",
  rarity: "RARE",
  levelRequirement: 10,
  strengthBonus: 6,
  wisdomBonus: 0,
  agilityBonus: 3,
  enduranceBonus: 0,
  weaponBase: 20,
  armorValue: 0,
};

const materialItem: ItemLike = {
  type: "MATERIAL",
  rarity: "COMMON",
  levelRequirement: 1,
  strengthBonus: 0,
  wisdomBonus: 0,
  agilityBonus: 0,
  enduranceBonus: 0,
  weaponBase: 0,
  armorValue: 0,
};

describe("deriveItemRequirements", () => {
  it("requires no stats for non-equippable items", () => {
    expect(deriveItemRequirements(materialItem)).toEqual({
      strength: 0,
      wisdom: 0,
      agility: 0,
      endurance: 0,
    });
  });

  it("puts the primary requirement on the dominant stat", () => {
    const req = deriveItemRequirements(swordItem);
    expect(req.strength).toBe(3 + Math.floor(10 * 0.6));
    expect(req.agility).toBe(3 + Math.floor(10 * 0.35));
  });

  it("has no secondary requirement for common items", () => {
    const req = deriveItemRequirements({ ...swordItem, rarity: "COMMON" });
    expect(req.agility).toBe(0);
    expect(req.strength).toBeGreaterThan(0);
  });
});

describe("checkItemRequirements", () => {
  it("flags each unmet requirement", () => {
    const check = checkItemRequirements(
      { level: 5, strength: 4, wisdom: 20, agility: 20, endurance: 20 },
      swordItem,
    );
    expect(check.met).toBe(false);
    expect(check.unmet).toContain("level");
    expect(check.unmet).toContain("strength");
    expect(check.unmet).not.toContain("agility");
  });

  it("passes when the subject meets every requirement", () => {
    const check = checkItemRequirements(
      { level: 20, strength: 50, wisdom: 50, agility: 50, endurance: 50 },
      swordItem,
    );
    expect(check.met).toBe(true);
    expect(check.unmet).toHaveLength(0);
  });
});
