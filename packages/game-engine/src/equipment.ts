import { UNARMED_WEAPON_BASE } from "./formulas";

export type EquipmentBonus = {
  strength: number;
  wisdom: number;
  agility: number;
  endurance: number;
  weaponBase: number;
  armorValue: number;
};

export const EMPTY_BONUS: EquipmentBonus = {
  strength: 0,
  wisdom: 0,
  agility: 0,
  endurance: 0,
  weaponBase: 0,
  armorValue: 0,
};

export function aggregateEquipment(pieces: EquipmentBonus[]): EquipmentBonus {
  return pieces.reduce<EquipmentBonus>(
    (total, piece) => ({
      strength: total.strength + piece.strength,
      wisdom: total.wisdom + piece.wisdom,
      agility: total.agility + piece.agility,
      endurance: total.endurance + piece.endurance,
      weaponBase: total.weaponBase + piece.weaponBase,
      armorValue: total.armorValue + piece.armorValue,
    }),
    { ...EMPTY_BONUS },
  );
}

export type BaseStats = {
  strength: number;
  wisdom: number;
  agility: number;
  endurance: number;
};

export type EffectiveStats = {
  strength: number;
  wisdom: number;
  agility: number;
  endurance: number;
  weaponBase: number;
  armorValue: number;
};

export function effectiveStats(base: BaseStats, bonus: EquipmentBonus): EffectiveStats {
  return {
    strength: base.strength + bonus.strength,
    wisdom: base.wisdom + bonus.wisdom,
    agility: base.agility + bonus.agility,
    endurance: base.endurance + bonus.endurance,
    weaponBase: UNARMED_WEAPON_BASE + bonus.weaponBase,
    armorValue: bonus.armorValue,
  };
}

export type StatName = "strength" | "wisdom" | "agility" | "endurance";

export type StatRequirement = {
  strength: number;
  wisdom: number;
  agility: number;
  endurance: number;
};

export type ItemLike = {
  type: string;
  rarity: string;
  levelRequirement: number;
  strengthBonus: number;
  wisdomBonus: number;
  agilityBonus: number;
  enduranceBonus: number;
  weaponBase: number;
  armorValue: number;
};

const EQUIP_TYPES = new Set([
  "WEAPON",
  "SHIELD",
  "HELMET",
  "ARMOR",
  "PANTS",
  "GLOVES",
  "BOOTS",
  "RING",
]);

const DEFAULT_REQ_STAT: Record<string, StatName> = {
  WEAPON: "strength",
  GLOVES: "strength",
  RING: "strength",
  SHIELD: "endurance",
  ARMOR: "endurance",
  PANTS: "endurance",
  HELMET: "endurance",
  BOOTS: "agility",
};

const SECONDARY_RARITIES = new Set(["RARE", "EPIC", "LEGENDARY"]);

const EMPTY_REQUIREMENT: StatRequirement = {
  strength: 0,
  wisdom: 0,
  agility: 0,
  endurance: 0,
};

export function deriveItemRequirements(item: ItemLike): StatRequirement {
  if (!EQUIP_TYPES.has(item.type)) {
    return { ...EMPTY_REQUIREMENT };
  }
  const level = item.levelRequirement;
  const bonuses: StatRequirement = {
    strength: item.strengthBonus,
    wisdom: item.wisdomBonus,
    agility: item.agilityBonus,
    endurance: item.enduranceBonus,
  };
  const defaultStat = DEFAULT_REQ_STAT[item.type] ?? "strength";
  const stats: StatName[] = ["strength", "wisdom", "agility", "endurance"];
  const ordered = [...stats].sort((a, b) => {
    const wa = bonuses[a] + (a === defaultStat ? 0.5 : 0);
    const wb = bonuses[b] + (b === defaultStat ? 0.5 : 0);
    return wb - wa;
  });
  const requirement: StatRequirement = { ...EMPTY_REQUIREMENT };
  const primary = ordered[0] ?? defaultStat;
  requirement[primary] = 3 + Math.floor(level * 0.6);
  if (SECONDARY_RARITIES.has(item.rarity)) {
    const secondary = ordered.find((s) => s !== primary && bonuses[s] > 0);
    if (secondary) {
      requirement[secondary] = 3 + Math.floor(level * 0.35);
    }
  }
  return requirement;
}

export type RequirementCheck = {
  met: boolean;
  level: boolean;
  strength: boolean;
  wisdom: boolean;
  agility: boolean;
  endurance: boolean;
  requirements: StatRequirement;
  unmet: string[];
};

export type RequirementSubject = {
  level: number;
  strength: number;
  wisdom: number;
  agility: number;
  endurance: number;
};

export function checkItemRequirements(
  subject: RequirementSubject,
  item: ItemLike,
): RequirementCheck {
  const requirements = deriveItemRequirements(item);
  const level = subject.level >= item.levelRequirement;
  const strength = subject.strength >= requirements.strength;
  const wisdom = subject.wisdom >= requirements.wisdom;
  const agility = subject.agility >= requirements.agility;
  const endurance = subject.endurance >= requirements.endurance;
  const unmet: string[] = [];
  if (!level) unmet.push("level");
  if (!strength) unmet.push("strength");
  if (!wisdom) unmet.push("wisdom");
  if (!agility) unmet.push("agility");
  if (!endurance) unmet.push("endurance");
  return {
    met: unmet.length === 0,
    level,
    strength,
    wisdom,
    agility,
    endurance,
    requirements,
    unmet,
  };
}
