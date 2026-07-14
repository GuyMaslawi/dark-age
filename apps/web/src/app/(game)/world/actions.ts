"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@kingdom/db";
import {
  ENERGY_BATTLE_COST,
  createRng,
  randomSeed,
  pveXpReward,
  rollGold,
  rollLoot,
  runBattle,
} from "@kingdom/game-engine";
import { requireUser } from "@/lib/session";
import { combatantFromCharacter, combatantFromMonster } from "@/lib/combat";
import { computeCharacterUpdate } from "@/lib/progression";
import type { BattleLogData } from "@/lib/battleLog";

export type WorldActionState = {
  error: string | null;
};

const DOMAIN_ERRORS: Record<string, string> = {
  NO_CHARACTER: "עדיין אין לך דמות",
  NO_MONSTER: "היצור לא נמצא",
  WRONG_LOCATION: "היצור לא נמצא באזור שלך",
  NO_ENERGY: "אין לך מספיק אנרגיה לקרב",
  NO_HP: "אתה חלש מדי כדי להילחם, נוח קודם",
  NOT_HERE: "האזור לא נמצא",
  SAME_LOCATION: "אתה כבר נמצא כאן",
  TRAVEL_NO_ENERGY: "אין לך מספיק אנרגיה למסע",
};

export async function attackMonsterAction(
  _prev: WorldActionState,
  formData: FormData,
): Promise<WorldActionState> {
  const user = await requireUser();
  const monsterId = String(formData.get("monsterId") ?? "");
  const seed = randomSeed();

  let battleId = "";
  try {
    battleId = await prisma.$transaction(async (tx) => {
      const character = await tx.character.findUnique({
        where: { userId: user.id },
        include: {
          inventory: {
            where: { equippedSlot: { not: null } },
            include: { item: true },
          },
        },
      });
      if (!character) throw new Error("NO_CHARACTER");
      if (character.hp <= 0) throw new Error("NO_HP");
      if (character.energy < ENERGY_BATTLE_COST) throw new Error("NO_ENERGY");

      const monster = await tx.monster.findUnique({
        where: { id: monsterId },
        include: { lootEntries: true },
      });
      if (!monster) throw new Error("NO_MONSTER");
      if (monster.locationId !== character.locationId) throw new Error("WRONG_LOCATION");

      const rng = createRng(seed);
      const outcome = runBattle(
        combatantFromCharacter(character, character.inventory),
        combatantFromMonster(monster),
        rng,
      );
      const won = outcome.winner === "A";
      const draw = outcome.winner === "DRAW";

      const xpGained = pveXpReward(monster.xpReward, won);
      const goldGained = won ? rollGold(monster.goldMin, monster.goldMax, rng) : 0;
      const lootItemId = won
        ? rollLoot(
            monster.lootEntries.map((entry) => ({
              itemId: entry.itemId,
              weight: entry.weight,
            })),
            rng,
          )
        : null;

      const update = computeCharacterUpdate(character, {
        xpGained,
        goldGained,
        won,
        draw,
        isPvp: false,
        postBattleHp: outcome.finalHpA,
      });
      update.data.energy = { decrement: ENERGY_BATTLE_COST };

      await tx.character.update({ where: { id: character.id }, data: update.data });

      let lootName: string | null = null;
      if (lootItemId) {
        const item = await tx.item.findUnique({ where: { id: lootItemId } });
        if (item) {
          lootName = item.name;
          await tx.inventoryItem.create({
            data: { characterId: character.id, itemId: item.id, quantity: 1 },
          });
        }
      }

      const log: BattleLogData = {
        version: 1,
        attacker: {
          name: character.name,
          startHp: Math.max(1, character.hp),
          avatarKey: character.avatarKey,
          gender: character.gender,
          level: character.level,
          kind: "character",
        },
        defender: {
          name: monster.name,
          startHp: monster.maxHp,
          avatarKey: null,
          gender: null,
          level: monster.level,
          kind: "monster",
        },
        turns: outcome.turns,
        winner: outcome.winner,
        finalHpA: outcome.finalHpA,
        finalHpB: outcome.finalHpB,
        rewards: {
          won,
          draw,
          xpGained,
          goldGained,
          leveledUp: update.leveledUp,
          newLevel: update.newLevel,
          lootName,
        },
      };

      const battle = await tx.battle.create({
        data: {
          type: "PVE",
          result: won ? "ATTACKER_WIN" : draw ? "DRAW" : "DEFENDER_WIN",
          attackerId: character.id,
          monsterId: monster.id,
          log: log as unknown as object,
          xpGained,
          goldGained,
        },
      });
      return battle.id;
    });
  } catch (error) {
    if (error instanceof Error && DOMAIN_ERRORS[error.message]) {
      return { error: DOMAIN_ERRORS[error.message] ?? "שגיאה" };
    }
    throw error;
  }

  revalidatePath("/", "layout");
  redirect(`/battles/${battleId}`);
}

export async function travelAction(
  _prev: WorldActionState,
  formData: FormData,
): Promise<WorldActionState> {
  const user = await requireUser();
  const locationId = String(formData.get("locationId") ?? "");

  try {
    await prisma.$transaction(async (tx) => {
      const character = await tx.character.findUnique({
        where: { userId: user.id },
      });
      if (!character) throw new Error("NO_CHARACTER");
      if (character.locationId === locationId) throw new Error("SAME_LOCATION");

      const destination = await tx.location.findUnique({
        where: { id: locationId },
      });
      if (!destination) throw new Error("NOT_HERE");
      if (character.energy < destination.energyCost) throw new Error("TRAVEL_NO_ENERGY");

      await tx.character.update({
        where: { id: character.id },
        data: {
          locationId: destination.id,
          energy: { decrement: destination.energyCost },
        },
      });
    });
  } catch (error) {
    if (error instanceof Error && DOMAIN_ERRORS[error.message]) {
      return { error: DOMAIN_ERRORS[error.message] ?? "שגיאה" };
    }
    throw error;
  }

  revalidatePath("/", "layout");
  return { error: null };
}
