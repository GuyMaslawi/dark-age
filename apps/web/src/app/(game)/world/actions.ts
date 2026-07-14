"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@kingdom/db";
import {
  ENERGY_BATTLE_COST,
  ENERGY_PVP_COST,
  randomSeed,
  pveXpReward,
  pvpXpReward,
  withinPvpRange,
} from "@kingdom/game-engine";
import { requireUser } from "@/lib/session";
import { combatantFromCharacter, combatantFromMonster } from "@/lib/combat";
import { syncRegen } from "@/lib/regen";
import type { FightState, FighterMeta } from "@/lib/fight";

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
  NO_TARGET: "השחקן לא נמצא",
  SELF: "אי אפשר לתקוף את עצמך",
  DIFF_REGION: "השחקן לא נמצא באזור שלך",
  OUT_OF_RANGE: "השחקן מחוץ לטווח הרמות שלך",
  PROTECTED: "השחקן מוגן מהתקפות כרגע",
  PVP_NO_ENERGY: "אין לך מספיק אנרגיה לקרב שחקנים",
};

const EQUIPPED_INCLUDE = {
  inventory: {
    where: { equippedSlot: { not: null } },
    include: { item: true },
  },
} as const;

export async function attackMonsterAction(
  _prev: WorldActionState,
  formData: FormData,
): Promise<WorldActionState> {
  const user = await requireUser();
  const monsterId = String(formData.get("monsterId") ?? "");
  const seed = randomSeed();
  const now = new Date();

  try {
    await prisma.$transaction(async (tx) => {
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
      await syncRegen(tx, character, now);
      if (character.hp <= 0) throw new Error("NO_HP");
      if (character.energy < ENERGY_BATTLE_COST) throw new Error("NO_ENERGY");

      const monster = await tx.monster.findUnique({
        where: { id: monsterId },
        include: { lootEntries: true },
      });
      if (!monster) throw new Error("NO_MONSTER");
      if (monster.locationId !== character.locationId) throw new Error("WRONG_LOCATION");

      await tx.character.update({
        where: { id: character.id },
        data: {
          energy: { decrement: ENERGY_BATTLE_COST },
          energyUpdatedAt: now,
        },
      });

      const a = combatantFromCharacter(character, character.inventory);
      const b = combatantFromMonster(monster);
      const aMeta: FighterMeta = {
        name: character.name,
        level: character.level,
        kind: "character",
        avatarKey: character.avatarKey,
        gender: character.gender,
        slug: null,
      };
      const bMeta: FighterMeta = {
        name: monster.name,
        level: monster.level,
        kind: "monster",
        avatarKey: null,
        gender: null,
        slug: monster.slug,
      };

      const state: FightState = {
        version: 1,
        type: "PVE",
        seed,
        round: 1,
        a,
        b,
        hpA: a.maxHp,
        hpB: b.maxHp,
        barMaxA: character.maxHp,
        barMaxB: monster.maxHp,
        aMeta,
        bMeta,
        monsterId: monster.id,
        defenderId: null,
        defenderLevel: null,
        reward: {
          xpWin: pveXpReward(monster.xpReward, true),
          goldMin: monster.goldMin,
          goldMax: monster.goldMax,
          loot: monster.lootEntries.map((entry) => ({
            itemId: entry.itemId,
            weight: entry.weight,
          })),
        },
        log: [],
        over: false,
        winner: null,
      };

      await tx.combatSession.upsert({
        where: { characterId: character.id },
        create: { characterId: character.id, state: state as unknown as object },
        update: { state: state as unknown as object },
      });
    });
  } catch (error) {
    if (error instanceof Error && DOMAIN_ERRORS[error.message]) {
      return { error: DOMAIN_ERRORS[error.message] ?? "שגיאה" };
    }
    throw error;
  }

  revalidatePath("/", "layout");
  redirect("/fight");
}

export async function attackPlayerAction(
  _prev: WorldActionState,
  formData: FormData,
): Promise<WorldActionState> {
  const user = await requireUser();
  const defenderId = String(formData.get("defenderId") ?? "");
  const seed = randomSeed();
  const now = new Date();

  try {
    await prisma.$transaction(async (tx) => {
      const attacker = await tx.character.findUnique({
        where: { userId: user.id },
        include: EQUIPPED_INCLUDE,
      });
      if (!attacker) throw new Error("NO_CHARACTER");
      await syncRegen(tx, attacker, now);
      if (attacker.hp <= 0) throw new Error("NO_HP");
      if (attacker.energy < ENERGY_PVP_COST) throw new Error("PVP_NO_ENERGY");

      const defender = await tx.character.findUnique({
        where: { id: defenderId },
        include: EQUIPPED_INCLUDE,
      });
      if (!defender) throw new Error("NO_TARGET");
      if (defender.id === attacker.id) throw new Error("SELF");
      if (defender.locationId !== attacker.locationId) throw new Error("DIFF_REGION");
      if (!withinPvpRange(attacker.level, defender.level)) throw new Error("OUT_OF_RANGE");
      if (defender.pvpProtectedUntil && defender.pvpProtectedUntil > now) {
        throw new Error("PROTECTED");
      }
      await syncRegen(tx, defender, now);

      await tx.character.update({
        where: { id: attacker.id },
        data: {
          energy: { decrement: ENERGY_PVP_COST },
          energyUpdatedAt: now,
          lastPvpAttackAt: now,
        },
      });

      const a = combatantFromCharacter(attacker, attacker.inventory);
      const b = combatantFromCharacter(defender, defender.inventory);
      const aMeta: FighterMeta = {
        name: attacker.name,
        level: attacker.level,
        kind: "character",
        avatarKey: attacker.avatarKey,
        gender: attacker.gender,
        slug: null,
      };
      const bMeta: FighterMeta = {
        name: defender.name,
        level: defender.level,
        kind: "character",
        avatarKey: defender.avatarKey,
        gender: defender.gender,
        slug: null,
      };

      const state: FightState = {
        version: 1,
        type: "PVP",
        seed,
        round: 1,
        a,
        b,
        hpA: a.maxHp,
        hpB: b.maxHp,
        barMaxA: attacker.maxHp,
        barMaxB: defender.maxHp,
        aMeta,
        bMeta,
        monsterId: null,
        defenderId: defender.id,
        defenderLevel: defender.level,
        reward: {
          xpWin: pvpXpReward(defender.level, true),
          goldMin: 0,
          goldMax: 0,
          loot: [],
        },
        log: [],
        over: false,
        winner: null,
      };

      await tx.combatSession.upsert({
        where: { characterId: attacker.id },
        create: { characterId: attacker.id, state: state as unknown as object },
        update: { state: state as unknown as object },
      });
    });
  } catch (error) {
    if (error instanceof Error && DOMAIN_ERRORS[error.message]) {
      return { error: DOMAIN_ERRORS[error.message] ?? "שגיאה" };
    }
    throw error;
  }

  revalidatePath("/", "layout");
  redirect("/fight");
}

export async function travelAction(
  _prev: WorldActionState,
  formData: FormData,
): Promise<WorldActionState> {
  const user = await requireUser();
  const locationId = String(formData.get("locationId") ?? "");
  const now = new Date();

  try {
    await prisma.$transaction(async (tx) => {
      const character = await tx.character.findUnique({
        where: { userId: user.id },
      });
      if (!character) throw new Error("NO_CHARACTER");
      if (character.locationId === locationId) throw new Error("SAME_LOCATION");
      await syncRegen(tx, character, now);

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
          energyUpdatedAt: now,
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
