import { EquipmentSlot, ItemType, type Item } from "@kingdom/db";
import type { EquipmentBonus } from "@kingdom/game-engine";

export const EQUIP_SLOTS: { slot: EquipmentSlot; label: string }[] = [
  { slot: EquipmentSlot.WEAPON, label: "נשק" },
  { slot: EquipmentSlot.SHIELD, label: "מגן" },
  { slot: EquipmentSlot.HELMET, label: "קסדה" },
  { slot: EquipmentSlot.ARMOR, label: "שריון" },
  { slot: EquipmentSlot.PANTS, label: "מכנסיים" },
  { slot: EquipmentSlot.GLOVES, label: "כפפות" },
  { slot: EquipmentSlot.BOOTS, label: "מגפיים" },
  { slot: EquipmentSlot.RING_ONE, label: "טבעת א׳" },
  { slot: EquipmentSlot.RING_TWO, label: "טבעת ב׳" },
];

const TYPE_TO_SLOTS: Record<ItemType, EquipmentSlot[]> = {
  WEAPON: [EquipmentSlot.WEAPON],
  SHIELD: [EquipmentSlot.SHIELD],
  HELMET: [EquipmentSlot.HELMET],
  ARMOR: [EquipmentSlot.ARMOR],
  PANTS: [EquipmentSlot.PANTS],
  GLOVES: [EquipmentSlot.GLOVES],
  BOOTS: [EquipmentSlot.BOOTS],
  RING: [EquipmentSlot.RING_ONE, EquipmentSlot.RING_TWO],
  MATERIAL: [],
  CONSUMABLE: [],
};

export function slotsForType(type: ItemType): EquipmentSlot[] {
  return TYPE_TO_SLOTS[type];
}

export function isEquippable(type: ItemType): boolean {
  return TYPE_TO_SLOTS[type].length > 0;
}

export function bonusFromItem(item: Item): EquipmentBonus {
  return {
    strength: item.strengthBonus,
    wisdom: item.wisdomBonus,
    agility: item.agilityBonus,
    endurance: item.enduranceBonus,
    weaponBase: item.weaponBase,
    armorValue: item.armorValue,
  };
}
