import { redirect } from "next/navigation";
import { ItemType, Rarity, prisma } from "@kingdom/db";
import { npcSellPrice } from "@kingdom/game-engine";
import { requireUser, getCurrentCharacter } from "@/lib/session";
import { ShopView, type ShopItemView, type SellItemView } from "./ShopView";

export default async function MarketPage() {
  const user = await requireUser();
  const character = await getCurrentCharacter(user.id);
  if (!character) {
    redirect("/character");
  }

  const [catalog, inventory] = await Promise.all([
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
  ]);

  const shopItems: ShopItemView[] = catalog.map((item) => ({
    itemId: item.id,
    name: item.name,
    description: item.description,
    rarity: item.rarity,
    levelRequirement: item.levelRequirement,
    price: item.basePrice,
    stats: {
      strengthBonus: item.strengthBonus,
      wisdomBonus: item.wisdomBonus,
      agilityBonus: item.agilityBonus,
      enduranceBonus: item.enduranceBonus,
      weaponBase: item.weaponBase,
      armorValue: item.armorValue,
    },
  }));

  const sellItems: SellItemView[] = inventory.map((entry) => ({
    inventoryItemId: entry.id,
    name: entry.item.name,
    rarity: entry.item.rarity,
    levelRequirement: entry.item.levelRequirement,
    sellPrice: npcSellPrice(entry.item.basePrice),
    stats: {
      strengthBonus: entry.item.strengthBonus,
      wisdomBonus: entry.item.wisdomBonus,
      agilityBonus: entry.item.agilityBonus,
      enduranceBonus: entry.item.enduranceBonus,
      weaponBase: entry.item.weaponBase,
      armorValue: entry.item.armorValue,
    },
  }));

  return <ShopView gold={character.gold} shopItems={shopItems} sellItems={sellItems} />;
}
