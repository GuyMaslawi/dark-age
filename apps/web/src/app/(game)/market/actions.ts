"use server";

import { revalidatePath } from "next/cache";
import { ItemType, Rarity, prisma } from "@kingdom/db";
import { npcSellPrice } from "@kingdom/game-engine";
import { requireUser } from "@/lib/session";

export type MarketActionState = {
  error: string | null;
  notice: string | null;
};

const ERRORS: Record<string, string> = {
  NO_CHARACTER: "עדיין אין לך דמות",
  NOT_FOR_SALE: "הפריט לא נמכר בחנות",
  NO_GOLD: "אין לך מספיק זהב",
  NOT_OWNED: "הפריט לא נמצא במלאי שלך",
  EQUIPPED: "אי אפשר למכור פריט לבוש, הסר אותו קודם",
};

const SHOP_RARITIES: Rarity[] = [Rarity.COMMON, Rarity.UNCOMMON];

export async function buyAction(
  _prev: MarketActionState,
  formData: FormData,
): Promise<MarketActionState> {
  const user = await requireUser();
  const itemId = String(formData.get("itemId") ?? "");

  try {
    const notice = await prisma.$transaction(async (tx) => {
      const character = await tx.character.findUnique({ where: { userId: user.id } });
      if (!character) throw new Error("NO_CHARACTER");

      const item = await tx.item.findUnique({ where: { id: itemId } });
      if (!item || item.type === ItemType.MATERIAL || !SHOP_RARITIES.includes(item.rarity)) {
        throw new Error("NOT_FOR_SALE");
      }
      if (character.gold < item.basePrice) throw new Error("NO_GOLD");

      await tx.character.update({
        where: { id: character.id },
        data: { gold: { decrement: item.basePrice } },
      });
      await tx.inventoryItem.create({
        data: { characterId: character.id, itemId: item.id, quantity: 1 },
      });
      return `קנית: ${item.name}`;
    });
    revalidatePath("/", "layout");
    return { error: null, notice };
  } catch (error) {
    if (error instanceof Error && ERRORS[error.message]) {
      return { error: ERRORS[error.message] ?? "שגיאה", notice: null };
    }
    throw error;
  }
}

export async function sellAction(
  _prev: MarketActionState,
  formData: FormData,
): Promise<MarketActionState> {
  const user = await requireUser();
  const inventoryItemId = String(formData.get("inventoryItemId") ?? "");

  try {
    const notice = await prisma.$transaction(async (tx) => {
      const character = await tx.character.findUnique({ where: { userId: user.id } });
      if (!character) throw new Error("NO_CHARACTER");

      const entry = await tx.inventoryItem.findFirst({
        where: { id: inventoryItemId, characterId: character.id },
        include: { item: true },
      });
      if (!entry) throw new Error("NOT_OWNED");
      if (entry.equippedSlot !== null) throw new Error("EQUIPPED");

      const price = npcSellPrice(entry.item.basePrice);
      await tx.inventoryItem.delete({ where: { id: entry.id } });
      await tx.character.update({
        where: { id: character.id },
        data: { gold: { increment: price } },
      });
      return `מכרת: ${entry.item.name} תמורת ${price} זהב`;
    });
    revalidatePath("/", "layout");
    return { error: null, notice };
  } catch (error) {
    if (error instanceof Error && ERRORS[error.message]) {
      return { error: ERRORS[error.message] ?? "שגיאה", notice: null };
    }
    throw error;
  }
}
