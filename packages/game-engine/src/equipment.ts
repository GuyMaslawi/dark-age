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
