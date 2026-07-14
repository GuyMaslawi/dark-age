import type { Character, Monster } from "@kingdom/db";
import { UNARMED_WEAPON_BASE, type Combatant } from "@kingdom/game-engine";

export function combatantFromCharacter(character: Character): Combatant {
  return {
    name: character.name,
    strength: character.strength,
    wisdom: character.wisdom,
    agility: character.agility,
    endurance: character.endurance,
    maxHp: Math.max(1, character.hp),
    weaponBase: UNARMED_WEAPON_BASE,
    armorValue: 0,
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
