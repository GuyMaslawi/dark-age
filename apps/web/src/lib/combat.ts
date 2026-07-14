import type { Character, InventoryItem, Item, Monster } from "@kingdom/db";
import {
  aggregateEquipment,
  effectiveStats,
  type Combatant,
} from "@kingdom/game-engine";
import { bonusFromItem } from "@/lib/equipment";

export type EquippedItem = InventoryItem & { item: Item };

export function combatantFromCharacter(
  character: Character,
  equipped: EquippedItem[],
): Combatant {
  const bonus = aggregateEquipment(equipped.map((entry) => bonusFromItem(entry.item)));
  const stats = effectiveStats(character, bonus);
  return {
    name: character.name,
    strength: stats.strength,
    wisdom: stats.wisdom,
    agility: stats.agility,
    endurance: stats.endurance,
    maxHp: Math.max(1, character.hp),
    weaponBase: stats.weaponBase,
    armorValue: stats.armorValue,
  };
}

export function combatantFromMonster(monster: Monster): Combatant {
  return {
    name: monster.name,
    strength: monster.strength,
    wisdom: monster.wisdom,
    agility: monster.agility,
    endurance: monster.endurance,
    maxHp: monster.maxHp,
    weaponBase: monster.weaponBase,
    armorValue: monster.armorValue,
  };
}
