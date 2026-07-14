"use server";

import { revalidatePath } from "next/cache";
import { ItemType, MarketListingStatus, Rarity, prisma } from "@kingdom/db";
import { npcSellPrice, marketNetProceeds } from "@kingdom/game-engine";
import { requireUser } from "@/lib/session";

const MAX_LISTING_PRICE = 100_000_000;

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
  BAD_PRICE: "מחיר לא תקין",
  NOT_AVAILABLE: "הפריט כבר לא זמין",
  OWN_LISTING: "אי אפשר לקנות מהצעה של עצמך",
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

export async function listItemAction(
  _prev: MarketActionState,
  formData: FormData,
): Promise<MarketActionState> {
  const user = await requireUser();
  const inventoryItemId = String(formData.get("inventoryItemId") ?? "");
  const price = Number(formData.get("price") ?? 0);
  if (!Number.isInteger(price) || price <= 0 || price > MAX_LISTING_PRICE) {
    return { error: ERRORS.BAD_PRICE ?? "שגיאה", notice: null };
  }

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

      await tx.inventoryItem.delete({ where: { id: entry.id } });
      await tx.marketListing.create({
        data: {
          sellerId: character.id,
          itemId: entry.itemId,
          price,
          status: MarketListingStatus.ACTIVE,
        },
      });
      return `${entry.item.name} הוצע למכירה תמורת ${price} זהב`;
    });
    revalidatePath("/market");
    return { error: null, notice };
  } catch (error) {
    if (error instanceof Error && ERRORS[error.message]) {
      return { error: ERRORS[error.message] ?? "שגיאה", notice: null };
    }
    throw error;
  }
}

export async function buyListingAction(
  _prev: MarketActionState,
  formData: FormData,
): Promise<MarketActionState> {
  const user = await requireUser();
  const listingId = String(formData.get("listingId") ?? "");
  const now = new Date();

  try {
    const notice = await prisma.$transaction(async (tx) => {
      const buyer = await tx.character.findUnique({ where: { userId: user.id } });
      if (!buyer) throw new Error("NO_CHARACTER");

      const listing = await tx.marketListing.findUnique({
        where: { id: listingId },
        include: { item: true },
      });
      if (!listing || listing.status !== MarketListingStatus.ACTIVE) {
        throw new Error("NOT_AVAILABLE");
      }
      if (listing.sellerId === buyer.id) throw new Error("OWN_LISTING");
      if (buyer.gold < listing.price) throw new Error("NO_GOLD");

      const claimed = await tx.marketListing.updateMany({
        where: { id: listing.id, status: MarketListingStatus.ACTIVE },
        data: { status: MarketListingStatus.SOLD, soldAt: now },
      });
      if (claimed.count === 0) throw new Error("NOT_AVAILABLE");

      await tx.character.update({
        where: { id: buyer.id },
        data: { gold: { decrement: listing.price } },
      });
      await tx.character.update({
        where: { id: listing.sellerId },
        data: { gold: { increment: marketNetProceeds(listing.price) } },
      });
      await tx.inventoryItem.create({
        data: { characterId: buyer.id, itemId: listing.itemId, quantity: 1 },
      });
      return `קנית: ${listing.item.name}`;
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

export async function cancelListingAction(
  _prev: MarketActionState,
  formData: FormData,
): Promise<MarketActionState> {
  const user = await requireUser();
  const listingId = String(formData.get("listingId") ?? "");

  try {
    const notice = await prisma.$transaction(async (tx) => {
      const character = await tx.character.findUnique({ where: { userId: user.id } });
      if (!character) throw new Error("NO_CHARACTER");

      const listing = await tx.marketListing.findUnique({ where: { id: listingId } });
      if (
        !listing ||
        listing.status !== MarketListingStatus.ACTIVE ||
        listing.sellerId !== character.id
      ) {
        throw new Error("NOT_OWNED");
      }

      await tx.marketListing.update({
        where: { id: listing.id },
        data: { status: MarketListingStatus.CANCELLED },
      });
      await tx.inventoryItem.create({
        data: { characterId: character.id, itemId: listing.itemId, quantity: 1 },
      });
      return "ההצעה בוטלה והפריט חזר למלאי";
    });
    revalidatePath("/market");
    return { error: null, notice };
  } catch (error) {
    if (error instanceof Error && ERRORS[error.message]) {
      return { error: ERRORS[error.message] ?? "שגיאה", notice: null };
    }
    throw error;
  }
}
