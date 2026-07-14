import { redirect } from "next/navigation";
import { ItemType, MarketListingStatus, Rarity, prisma } from "@kingdom/db";
import {
  npcSellPrice,
  marketNetProceeds,
  checkItemRequirements,
} from "@kingdom/game-engine";
import { requireUser, getCurrentCharacter } from "@/lib/session";
import {
  ShopView,
  type ShopItemView,
  type SellItemView,
  type ListingView,
  type MyListingView,
} from "./ShopView";

export default async function MarketPage() {
  const user = await requireUser();
  const character = await getCurrentCharacter(user.id);
  if (!character) {
    redirect("/character");
  }

  const [catalog, inventory, activeListings, myListings] = await Promise.all([
    prisma.item.findMany({
      where: {
        rarity: { in: [Rarity.COMMON, Rarity.UNCOMMON] },
        type: { not: ItemType.MATERIAL },
      },
      orderBy: [{ levelRequirement: "asc" }, { basePrice: "asc" }],
    }),
    prisma.inventoryItem.findMany({
      where: { characterId: character.id, equippedSlot: null },
      include: { item: true },
      orderBy: [{ item: { rarity: "desc" } }, { createdAt: "desc" }],
    }),
    prisma.marketListing.findMany({
      where: { status: MarketListingStatus.ACTIVE, sellerId: { not: character.id } },
      include: { item: true, seller: { select: { name: true } } },
      orderBy: { price: "asc" },
      take: 60,
    }),
    prisma.marketListing.findMany({
      where: { status: MarketListingStatus.ACTIVE, sellerId: character.id },
      include: { item: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const subject = {
    level: character.level,
    strength: character.strength,
    wisdom: character.wisdom,
    agility: character.agility,
    endurance: character.endurance,
  };

  const shopItems: ShopItemView[] = catalog.map((item) => {
    const check = checkItemRequirements(subject, item);
    return {
      itemId: item.id,
      name: item.name,
      description: item.description,
      rarity: item.rarity,
      type: item.type,
      slug: item.slug,
      levelRequirement: item.levelRequirement,
      price: item.basePrice,
      requirements: check.requirements,
      unmetReqs: check.unmet,
      stats: {
        strengthBonus: item.strengthBonus,
        wisdomBonus: item.wisdomBonus,
        agilityBonus: item.agilityBonus,
        enduranceBonus: item.enduranceBonus,
        weaponBase: item.weaponBase,
        armorValue: item.armorValue,
      },
    };
  });

  const sellItems: SellItemView[] = inventory.map((entry) => {
    const check = checkItemRequirements(subject, entry.item);
    return {
      inventoryItemId: entry.id,
      name: entry.item.name,
      rarity: entry.item.rarity,
      type: entry.item.type,
      slug: entry.item.slug,
      levelRequirement: entry.item.levelRequirement,
      sellPrice: npcSellPrice(entry.item.basePrice),
      requirements: check.requirements,
      unmetReqs: check.unmet,
      stats: {
        strengthBonus: entry.item.strengthBonus,
        wisdomBonus: entry.item.wisdomBonus,
        agilityBonus: entry.item.agilityBonus,
        enduranceBonus: entry.item.enduranceBonus,
        weaponBase: entry.item.weaponBase,
        armorValue: entry.item.armorValue,
      },
    };
  });

  const listings: ListingView[] = activeListings.map((listing) => {
    const check = checkItemRequirements(subject, listing.item);
    return {
      listingId: listing.id,
      name: listing.item.name,
      rarity: listing.item.rarity,
      type: listing.item.type,
      slug: listing.item.slug,
      levelRequirement: listing.item.levelRequirement,
      price: listing.price,
      sellerName: listing.seller.name,
      requirements: check.requirements,
      unmetReqs: check.unmet,
      stats: {
        strengthBonus: listing.item.strengthBonus,
        wisdomBonus: listing.item.wisdomBonus,
        agilityBonus: listing.item.agilityBonus,
        enduranceBonus: listing.item.enduranceBonus,
        weaponBase: listing.item.weaponBase,
        armorValue: listing.item.armorValue,
      },
    };
  });

  const mine: MyListingView[] = myListings.map((listing) => ({
    listingId: listing.id,
    name: listing.item.name,
    rarity: listing.item.rarity,
    price: listing.price,
    proceeds: marketNetProceeds(listing.price),
  }));

  const listable = inventory.map((entry) => ({
    inventoryItemId: entry.id,
    name: entry.item.name,
    rarity: entry.item.rarity,
  }));

  return (
    <ShopView
      gold={character.gold}
      shopItems={shopItems}
      sellItems={sellItems}
      listings={listings}
      myListings={mine}
      listable={listable}
    />
  );
}
