import { redirect } from "next/navigation";
import { prisma } from "@kingdom/db";
import { ENERGY_BATTLE_COST, ENERGY_PVP_COST, pvpLevelBounds } from "@kingdom/game-engine";
import { requireUser, getCurrentCharacter } from "@/lib/session";
import { WorldScene } from "./WorldScene";

export default async function WorldPage() {
  const user = await requireUser();
  const character = await getCurrentCharacter(user.id);
  if (!character) {
    redirect("/character");
  }

  const { low, high } = pvpLevelBounds(character.level);
  const now = new Date();
  const [locations, monsters, opponents] = await Promise.all([
    prisma.location.findMany({ orderBy: { orderIndex: "asc" } }),
    prisma.monster.findMany({
      where: { locationId: character.locationId },
      orderBy: { level: "asc" },
    }),
    prisma.character.findMany({
      where: {
        locationId: character.locationId,
        id: { not: character.id },
        level: { gte: low, lte: high },
      },
      orderBy: { level: "asc" },
      take: 30,
    }),
  ]);

  return (
    <WorldScene
      currentLocation={{ slug: character.location.slug, name: character.location.name }}
      energy={character.energy}
      battleCost={ENERGY_BATTLE_COST}
      pvpCost={ENERGY_PVP_COST}
      characterLevel={character.level}
      locations={locations.map((location) => ({
        id: location.id,
        slug: location.slug,
        name: location.name,
        minLevel: location.minLevel,
        maxLevel: location.maxLevel,
        energyCost: location.energyCost,
      }))}
      monsters={monsters.map((monster) => ({
        id: monster.id,
        slug: monster.slug,
        name: monster.name,
        level: monster.level,
        maxHp: monster.maxHp,
        xpReward: monster.xpReward,
        goldMin: monster.goldMin,
        goldMax: monster.goldMax,
      }))}
      opponents={opponents.map((opponent) => ({
        id: opponent.id,
        name: opponent.name,
        level: opponent.level,
        subLevel: opponent.subLevel,
        pvpWins: opponent.pvpWins,
        pvpLosses: opponent.pvpLosses,
        protected:
          opponent.pvpProtectedUntil !== null && opponent.pvpProtectedUntil > now,
      }))}
    />
  );
}
