import type { EquipmentSlot } from "@kingdom/db";
import { prisma } from "@kingdom/db";
import { aggregateEquipment, effectiveStats } from "@kingdom/game-engine";
import { requireUser, getCurrentCharacter } from "@/lib/session";
import { bonusFromItem } from "@/lib/equipment";
import { CreateCharacterForm } from "./CreateCharacterForm";
import { CharacterSheet, type EquippedView } from "./CharacterSheet";

export default async function CharacterPage() {
  const user = await requireUser();
  const character = await getCurrentCharacter(user.id);

  if (!character) {
    return <CreateCharacterForm />;
  }

  const equipped = await prisma.inventoryItem.findMany({
    where: { characterId: character.id, equippedSlot: { not: null } },
    include: { item: true },
  });

  const equippedBySlot: Partial<Record<EquipmentSlot, EquippedView>> = {};
  for (const entry of equipped) {
    if (entry.equippedSlot) {
      equippedBySlot[entry.equippedSlot] = {
        slug: entry.item.slug,
        name: entry.item.name,
        rarity: entry.item.rarity,
        type: entry.item.type,
      };
    }
  }

  const bonus = aggregateEquipment(equipped.map((entry) => bonusFromItem(entry.item)));
  const effective = effectiveStats(character, bonus);

  return (
    <CharacterSheet
      character={character}
      equippedBySlot={equippedBySlot}
      effective={effective}
    />
  );
}
