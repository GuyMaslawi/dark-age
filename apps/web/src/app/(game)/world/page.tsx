import { redirect } from "next/navigation";
import { prisma } from "@kingdom/db";
import { ENERGY_BATTLE_COST } from "@kingdom/game-engine";
import { requireUser, getCurrentCharacter } from "@/lib/session";
import { WorldMap } from "./WorldMap";
import { MonsterList } from "./MonsterList";

export default async function WorldPage() {
  const user = await requireUser();
  const character = await getCurrentCharacter(user.id);
  if (!character) {
    redirect("/character");
  }

  const [locations, monsters] = await Promise.all([
    prisma.location.findMany({ orderBy: { orderIndex: "asc" } }),
    prisma.monster.findMany({
      where: { locationId: character.locationId },
      orderBy: { level: "asc" },
    }),
  ]);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gold">מפת העולם</h1>
        <p className="mt-1 text-sm text-neutral-400">
          אתה נמצא ב{character.location.name}. בחר אזור למסע או תקוף יצור.
        </p>
      </div>

      <WorldMap
        locations={locations.map((location) => ({
          id: location.id,
          name: location.name,
          description: location.description,
          minLevel: location.minLevel,
          maxLevel: location.maxLevel,
          energyCost: location.energyCost,
        }))}
        currentLocationId={character.locationId}
        energy={character.energy}
      />

      <MonsterList
        locationName={character.location.name}
        energy={character.energy}
        battleCost={ENERGY_BATTLE_COST}
        characterLevel={character.level}
        monsters={monsters.map((monster) => ({
          id: monster.id,
          name: monster.name,
          level: monster.level,
          maxHp: monster.maxHp,
          xpReward: monster.xpReward,
          goldMin: monster.goldMin,
          goldMax: monster.goldMax,
        }))}
      />
    </div>
  );
}
