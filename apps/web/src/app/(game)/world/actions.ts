"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@kingdom/db";
import {
  ENERGY_BATTLE_COST,
  ENERGY_PVP_COST,
  PVP_PROTECTION_MINUTES,
  createRng,
  randomSeed,
  pveXpReward,
  pvpXpReward,
  rollGold,
  rollLoot,
  runBattle,
  withinPvpRange,
} from "@kingdom/game-engine";
import { requireUser } from "@/lib/session";
import { combatantFromCharacter, combatantFromMonster } from "@/lib/combat";
import { computeCharacterUpdate } from "@/lib/progression";
import { syncRegen } from "@/lib/regen";
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
      await syncRegen(tx, character, now);
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
      update.data.hpUpdatedAt = now;
      update.data.energyUpdatedAt = now;

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

export async function attackPlayerAction(
  _prev: WorldActionState,
  formData: FormData,
): Promise<WorldActionState> {
  const user = await requireUser();
  const defenderId = String(formData.get("defenderId") ?? "");
  const seed = randomSeed();
  const now = new Date();

  let battleId = "";
  try {
    battleId = await prisma.$transaction(async (tx) => {
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

      const rng = createRng(seed);
      const outcome = runBattle(
        combatantFromCharacter(attacker, attacker.inventory),
        combatantFromCharacter(defender, defender.inventory),
        rng,
      );
      const attackerWon = outcome.winner === "A";
      const defenderWon = outcome.winner === "B";
      const draw = outcome.winner === "DRAW";

      const xpAttacker = pvpXpReward(defender.level, attackerWon);
      const xpDefender = pvpXpReward(attacker.level, defenderWon);
      const protectUntil = new Date(now.getTime() + PVP_PROTECTION_MINUTES * 60000);

      const attackerUpdate = computeCharacterUpdate(attacker, {
        xpGained: xpAttacker,
        goldGained: 0,
        won: attackerWon,
        draw,
        isPvp: true,
        postBattleHp: outcome.finalHpA,
      });
      attackerUpdate.data.energy = { decrement: ENERGY_PVP_COST };
      attackerUpdate.data.lastPvpAttackAt = now;
      attackerUpdate.data.hpUpdatedAt = now;
      attackerUpdate.data.energyUpdatedAt = now;
      if (defenderWon) {
        attackerUpdate.data.pvpProtectedUntil = protectUntil;
      }

      const defenderUpdate = computeCharacterUpdate(defender, {
        xpGained: xpDefender,
        goldGained: 0,
        won: defenderWon,
        draw,
        isPvp: true,
        postBattleHp: outcome.finalHpB,
      });
      defenderUpdate.data.hpUpdatedAt = now;
      if (attackerWon) {
        defenderUpdate.data.pvpProtectedUntil = protectUntil;
      }

      await tx.character.update({ where: { id: attacker.id }, data: attackerUpdate.data });
      await tx.character.update({ where: { id: defender.id }, data: defenderUpdate.data });

      const log: BattleLogData = {
        version: 1,
        attacker: {
          name: attacker.name,
          startHp: Math.max(1, attacker.hp),
          avatarKey: attacker.avatarKey,
          gender: attacker.gender,
          level: attacker.level,
          kind: "character",
        },
        defender: {
          name: defender.name,
          startHp: Math.max(1, defender.hp),
          avatarKey: defender.avatarKey,
          gender: defender.gender,
          level: defender.level,
          kind: "character",
        },
        turns: outcome.turns,
        winner: outcome.winner,
        finalHpA: outcome.finalHpA,
        finalHpB: outcome.finalHpB,
        rewards: {
          won: attackerWon,
          draw,
          xpGained: xpAttacker,
          goldGained: 0,
          leveledUp: attackerUpdate.leveledUp,
          newLevel: attackerUpdate.newLevel,
          lootName: null,
        },
      };

      const battle = await tx.battle.create({
        data: {
          type: "PVP",
          result: attackerWon ? "ATTACKER_WIN" : draw ? "DRAW" : "DEFENDER_WIN",
          attackerId: attacker.id,
          defenderId: defender.id,
          log: log as unknown as object,
          xpGained: xpAttacker,
          goldGained: 0,
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
