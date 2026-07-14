"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma, type Prisma } from "@kingdom/db";
import {
  aiMove,
  resolveRound,
  createRng,
  rollGold,
  rollLoot,
  pvpXpReward,
  PVP_PROTECTION_MINUTES,
  type BattleTurn,
  type BodyRegion,
} from "@kingdom/game-engine";
import { requireUser } from "@/lib/session";
import { computeCharacterUpdate } from "@/lib/progression";
import { notifyPlayer } from "@/lib/socket";
import { toFightView, type FightState, type FightView, type FightRewards } from "@/lib/fight";
import type { BattleLogData } from "@/lib/battleLog";

export type RoundActionState = {
  error: string | null;
  view: FightView | null;
};

const REGIONS = new Set<BodyRegion>(["HEAD", "TORSO", "LEGS"]);

const ERRORS: Record<string, string> = {
  NO_CHARACTER: "עדיין אין לך דמות",
  NO_SESSION: "אין קרב פעיל",
  BAD_REGION: "בחר איזור תקיפה ואיזור הגנה",
};

function roundsToTurns(state: FightState): BattleTurn[] {
  const turns: BattleTurn[] = [];
  for (const round of state.log) {
    for (const strike of round.strikes) {
      turns.push({
        round: round.round,
        actor: strike.actor,
        hit: strike.outcome !== "MISS",
        crit: strike.outcome === "CRIT",
        damage: strike.damage,
        hpA: round.hpA,
        hpB: round.hpB,
      });
    }
  }
  return turns;
}

async function finishBattle(
  tx: Prisma.TransactionClient,
  character: { id: string; level: number; name: string },
  state: FightState,
  now: Date,
): Promise<{ rewards: FightRewards; notify: { defenderId: string; won: boolean } | null }> {
  const rng = createRng((state.seed ^ 0x5bd1e995) >>> 0);
  const won = state.winner === "A";
  const draw = state.winner === "DRAW";

  const full = await tx.character.findUniqueOrThrow({ where: { id: character.id } });

  if (state.type === "PVE") {
    const xpGained = won ? state.reward.xpWin : 0;
    const goldGained = won ? rollGold(state.reward.goldMin, state.reward.goldMax, rng) : 0;
    const lootItemId = won ? rollLoot(state.reward.loot, rng) : null;

    const update = computeCharacterUpdate(full, {
      xpGained,
      goldGained,
      won,
      draw,
      isPvp: false,
      postBattleHp: state.hpA,
    });
    update.data.hpUpdatedAt = now;
    await tx.character.update({ where: { id: full.id }, data: update.data });

    let lootName: string | null = null;
    if (lootItemId) {
      const item = await tx.item.findUnique({ where: { id: lootItemId } });
      if (item) {
        lootName = item.name;
        await tx.inventoryItem.create({
          data: { characterId: full.id, itemId: item.id, quantity: 1 },
        });
      }
    }

    const rewards: FightRewards = {
      won,
      draw,
      xpGained,
      xpPotential: state.reward.xpWin,
      goldGained,
      lootName,
      leveledUp: update.leveledUp,
      newLevel: update.newLevel,
    };

    await writeBattle(tx, state, now, rewards, {
      attackerId: full.id,
      monsterId: state.monsterId,
      defenderId: null,
    });

    return { rewards, notify: null };
  }

  const attackerWon = won;
  const defenderWon = state.winner === "B";
  const xpAttacker = attackerWon ? state.reward.xpWin : 0;
  const xpDefender = state.defenderLevel !== null ? pvpXpReward(full.level, defenderWon) : 0;
  const protectUntil = new Date(now.getTime() + PVP_PROTECTION_MINUTES * 60000);

  const attackerUpdate = computeCharacterUpdate(full, {
    xpGained: xpAttacker,
    goldGained: 0,
    won: attackerWon,
    draw,
    isPvp: true,
    postBattleHp: state.hpA,
  });
  attackerUpdate.data.hpUpdatedAt = now;
  if (defenderWon) {
    attackerUpdate.data.pvpProtectedUntil = protectUntil;
  }
  await tx.character.update({ where: { id: full.id }, data: attackerUpdate.data });

  if (state.defenderId) {
    const defender = await tx.character.findUnique({ where: { id: state.defenderId } });
    if (defender) {
      const defenderUpdate = computeCharacterUpdate(defender, {
        xpGained: xpDefender,
        goldGained: 0,
        won: defenderWon,
        draw,
        isPvp: true,
        postBattleHp: state.hpB,
      });
      defenderUpdate.data.hpUpdatedAt = now;
      if (attackerWon) {
        defenderUpdate.data.pvpProtectedUntil = protectUntil;
      }
      await tx.character.update({ where: { id: defender.id }, data: defenderUpdate.data });
    }
  }

  const rewards: FightRewards = {
    won: attackerWon,
    draw,
    xpGained: xpAttacker,
    xpPotential: state.reward.xpWin,
    goldGained: 0,
    lootName: null,
    leveledUp: attackerUpdate.leveledUp,
    newLevel: attackerUpdate.newLevel,
  };

  await writeBattle(tx, state, now, rewards, {
    attackerId: full.id,
    monsterId: null,
    defenderId: state.defenderId,
  });

  return {
    rewards,
    notify: state.defenderId ? { defenderId: state.defenderId, won: attackerWon } : null,
  };
}

async function writeBattle(
  tx: Prisma.TransactionClient,
  state: FightState,
  now: Date,
  rewards: FightRewards,
  ids: { attackerId: string; monsterId: string | null; defenderId: string | null },
): Promise<void> {
  const log: BattleLogData = {
    version: 1,
    attacker: {
      name: state.aMeta.name,
      startHp: state.a.maxHp,
      avatarKey: state.aMeta.avatarKey,
      gender: state.aMeta.gender,
      level: state.aMeta.level,
      kind: state.aMeta.kind,
      slug: state.aMeta.slug,
    },
    defender: {
      name: state.bMeta.name,
      startHp: state.b.maxHp,
      avatarKey: state.bMeta.avatarKey,
      gender: state.bMeta.gender,
      level: state.bMeta.level,
      kind: state.bMeta.kind,
      slug: state.bMeta.slug,
    },
    turns: roundsToTurns(state),
    winner: state.winner ?? "DRAW",
    finalHpA: state.hpA,
    finalHpB: state.hpB,
    rewards: {
      won: rewards.won,
      draw: rewards.draw,
      xpGained: rewards.xpGained,
      goldGained: rewards.goldGained,
      leveledUp: rewards.leveledUp,
      newLevel: rewards.newLevel,
      lootName: rewards.lootName,
    },
  };

  await tx.battle.create({
    data: {
      type: state.type,
      result:
        state.winner === "A" ? "ATTACKER_WIN" : state.winner === "B" ? "DEFENDER_WIN" : "DRAW",
      attackerId: ids.attackerId,
      defenderId: ids.defenderId,
      monsterId: ids.monsterId,
      log: log as unknown as object,
      xpGained: rewards.xpGained,
      goldGained: rewards.goldGained,
    },
  });
}

export async function roundAction(
  _prev: RoundActionState,
  formData: FormData,
): Promise<RoundActionState> {
  const user = await requireUser();
  const strike = String(formData.get("strike") ?? "") as BodyRegion;
  const guard = String(formData.get("guard") ?? "") as BodyRegion;
  if (!REGIONS.has(strike) || !REGIONS.has(guard)) {
    return { error: ERRORS.BAD_REGION ?? "שגיאה", view: null };
  }
  const now = new Date();

  let notify: { defenderId: string; won: boolean } | null = null;
  let view: FightView | null = null;

  try {
    view = await prisma.$transaction(async (tx) => {
      const character = await tx.character.findUnique({ where: { userId: user.id } });
      if (!character) throw new Error("NO_CHARACTER");

      const session = await tx.combatSession.findUnique({
        where: { characterId: character.id },
      });
      if (!session) throw new Error("NO_SESSION");

      const state = session.state as unknown as FightState;
      if (state.over) {
        return toFightView(state, null);
      }

      const bMove = aiMove(state.seed, state.round);
      const result = resolveRound({
        a: state.a,
        b: state.b,
        hpA: state.hpA,
        hpB: state.hpB,
        round: state.round,
        aMove: { strike, guard },
        bMove,
        seed: state.seed,
      });

      state.hpA = result.hpA;
      state.hpB = result.hpB;
      state.log.push(result);
      state.round += 1;

      if (result.over) {
        state.over = true;
        state.winner = result.winner;
        const finished = await finishBattle(tx, character, state, now);
        notify = finished.notify;
        await tx.combatSession.delete({ where: { characterId: character.id } });
        return toFightView(state, finished.rewards);
      }

      await tx.combatSession.update({
        where: { characterId: character.id },
        data: { state: state as unknown as object },
      });
      return toFightView(state, null);
    });
  } catch (error) {
    if (error instanceof Error && ERRORS[error.message]) {
      return { error: ERRORS[error.message] ?? "שגיאה", view: null };
    }
    throw error;
  }

  if (notify) {
    const info = notify as { defenderId: string; won: boolean };
    await notifyPlayer(info.defenderId, {
      kind: "ATTACKED",
      title: "הותקפת!",
      body: info.won ? "שחקן תקף אותך וניצח" : "שחקן תקף אותך — הגנת בהצלחה",
      createdAt: now.toISOString(),
    });
  }

  if (view?.over) {
    revalidatePath("/", "layout");
  }
  return { error: null, view };
}

export async function abandonAction(): Promise<void> {
  const user = await requireUser();
  const character = await prisma.character.findUnique({ where: { userId: user.id } });
  if (character) {
    await prisma.combatSession.deleteMany({ where: { characterId: character.id } });
  }
  revalidatePath("/", "layout");
  redirect("/world");
}
