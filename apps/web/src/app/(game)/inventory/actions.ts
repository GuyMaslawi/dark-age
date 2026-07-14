"use server";

import { revalidatePath } from "next/cache";
import { EquipmentSlot, prisma } from "@kingdom/db";
import { checkItemRequirements } from "@kingdom/game-engine";
import { requireUser } from "@/lib/session";
import { isEquippable, slotsForType } from "@/lib/equipment";

export type InventoryActionState = {
  error: string | null;
};

const ERRORS: Record<string, string> = {
  NO_CHARACTER: "עדיין אין לך דמות",
  NOT_OWNED: "הפריט לא נמצא במלאי שלך",
  NOT_EQUIPPABLE: "לא ניתן ללבוש פריט זה",
  LEVEL_TOO_LOW: "הרמה שלך נמוכה מדי לפריט זה",
  STATS_TOO_LOW: "אינך עומד בדרישות המאפיינים של הפריט",
};

function chooseRingSlot(occupied: Set<EquipmentSlot | null>): EquipmentSlot {
  if (!occupied.has(EquipmentSlot.RING_ONE)) return EquipmentSlot.RING_ONE;
  if (!occupied.has(EquipmentSlot.RING_TWO)) return EquipmentSlot.RING_TWO;
  return EquipmentSlot.RING_ONE;
}

export async function equipAction(
  _prev: InventoryActionState,
  formData: FormData,
): Promise<InventoryActionState> {
  const user = await requireUser();
  const inventoryItemId = String(formData.get("inventoryItemId") ?? "");

  try {
    await prisma.$transaction(async (tx) => {
      const character = await tx.character.findUnique({ where: { userId: user.id } });
      if (!character) throw new Error("NO_CHARACTER");

      const entry = await tx.inventoryItem.findFirst({
        where: { id: inventoryItemId, characterId: character.id },
        include: { item: true },
      });
      if (!entry) throw new Error("NOT_OWNED");
      if (!isEquippable(entry.item.type)) throw new Error("NOT_EQUIPPABLE");
      if (character.level < entry.item.levelRequirement) throw new Error("LEVEL_TOO_LOW");
      const check = checkItemRequirements(
        {
          level: character.level,
          strength: character.strength,
          wisdom: character.wisdom,
          agility: character.agility,
          endurance: character.endurance,
        },
        entry.item,
      );
      if (!check.met) throw new Error("STATS_TOO_LOW");

      const slots = slotsForType(entry.item.type);
      let targetSlot = slots[0];
      if (slots.length > 1) {
        const equipped = await tx.inventoryItem.findMany({
          where: { characterId: character.id, equippedSlot: { not: null } },
          select: { equippedSlot: true },
        });
        targetSlot = chooseRingSlot(new Set(equipped.map((e) => e.equippedSlot)));
      }
      if (!targetSlot) throw new Error("NOT_EQUIPPABLE");

      await tx.inventoryItem.updateMany({
        where: { characterId: character.id, equippedSlot: targetSlot },
        data: { equippedSlot: null },
      });
      await tx.inventoryItem.update({
        where: { id: entry.id },
        data: { equippedSlot: targetSlot },
      });
    });
  } catch (error) {
    if (error instanceof Error && ERRORS[error.message]) {
      return { error: ERRORS[error.message] ?? "שגיאה" };
    }
    throw error;
  }

  revalidatePath("/", "layout");
  return { error: null };
}

export async function unequipAction(
  _prev: InventoryActionState,
  formData: FormData,
): Promise<InventoryActionState> {
  const user = await requireUser();
  const inventoryItemId = String(formData.get("inventoryItemId") ?? "");

  try {
    await prisma.$transaction(async (tx) => {
      const character = await tx.character.findUnique({ where: { userId: user.id } });
      if (!character) throw new Error("NO_CHARACTER");
      const updated = await tx.inventoryItem.updateMany({
        where: { id: inventoryItemId, characterId: character.id },
        data: { equippedSlot: null },
      });
      if (updated.count === 0) throw new Error("NOT_OWNED");
    });
  } catch (error) {
    if (error instanceof Error && ERRORS[error.message]) {
      return { error: ERRORS[error.message] ?? "שגיאה" };
    }
    throw error;
  }

  revalidatePath("/", "layout");
  return { error: null };
}
