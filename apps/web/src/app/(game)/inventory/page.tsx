import { redirect } from "next/navigation";
import { prisma, type EquipmentSlot } from "@kingdom/db";
import { aggregateEquipment, effectiveStats } from "@kingdom/game-engine";
import { requireUser, getCurrentCharacter } from "@/lib/session";
import { bonusFromItem, isEquippable } from "@/lib/equipment";
import { InventoryView, type InventoryItemView } from "./InventoryView";

export default async function InventoryPage() {
  const user = await requireUser();
  const character = await getCurrentCharacter(user.id);
  if (!character) {
    redirect("/character");
  }

  const inventory = await prisma.inventoryItem.findMany({
    where: { characterId: character.id },
    include: { item: true },
    orderBy: [{ item: { rarity: "desc" } }, { createdAt: "desc" }],
  });

  const toView = (entry: (typeof inventory)[number]): InventoryItemView => ({
    inventoryItemId: entry.id,
    equippedSlot: entry.equippedSlot,
    name: entry.item.name,
    description: entry.item.description,
    rarity: entry.item.rarity,
    type: entry.item.type,
    levelRequirement: entry.item.levelRequirement,
    equippable: isEquippable(entry.item.type),
    meetsLevel: character.level >= entry.item.levelRequirement,
    stats: {
      strengthBonus: entry.item.strengthBonus,
      wisdomBonus: entry.item.wisdomBonus,
      agilityBonus: entry.item.agilityBonus,
      enduranceBonus: entry.item.enduranceBonus,
      weaponBase: entry.item.weaponBase,
      armorValue: entry.item.armorValue,
    },
  });

  const equippedEntries = inventory.filter((entry) => entry.equippedSlot !== null);
  const backpack = inventory
    .filter((entry) => entry.equippedSlot === null)
    .map(toView);

  const equippedBySlot: Partial<Record<EquipmentSlot, InventoryItemView>> = {};
  for (const entry of equippedEntries) {
    if (entry.equippedSlot) {
      equippedBySlot[entry.equippedSlot] = toView(entry);
    }
  }

  const bonus = aggregateEquipment(equippedEntries.map((e) => bonusFromItem(e.item)));
  const effective = effectiveStats(character, bonus);

  return (
    <InventoryView
      equippedBySlot={equippedBySlot}
      backpack={backpack}
      base={{
        strength: character.strength,
        wisdom: character.wisdom,
        agility: character.agility,
        endurance: character.endurance,
      }}
      effective={effective}
    />
  );
}
