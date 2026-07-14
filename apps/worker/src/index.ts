import { config } from "dotenv";
import { prisma } from "@kingdom/db";
import {
  applyRegen,
  HP_REGEN_INTERVAL_MS,
  ENERGY_REGEN_INTERVAL_MS,
} from "@kingdom/game-engine";

config({ path: new URL("../../../packages/db/.env", import.meta.url).pathname });

const TICK_INTERVAL_MS = 15_000;
const REGEN_BATCH = 500;
const JOB_BATCH = 50;

type RegenRow = {
  id: string;
  hp: number;
  maxHp: number;
  hpUpdatedAt: Date;
  energy: number;
  maxEnergy: number;
  energyUpdatedAt: Date;
};

async function completeProfessionJobs(now: Date): Promise<number> {
  return prisma.$transaction(async (tx) => {
    const due = await tx.$queryRaw<
      { id: string; characterId: string; goldReward: number }[]
    >`
      SELECT id, "characterId", "goldReward"
      FROM "ProfessionJob"
      WHERE status = 'ACTIVE' AND "finishesAt" <= ${now}
      ORDER BY "finishesAt" ASC
      FOR UPDATE SKIP LOCKED
      LIMIT ${JOB_BATCH}
    `;
    for (const job of due) {
      await tx.professionJob.update({
        where: { id: job.id },
        data: { status: "COMPLETED" },
      });
      await tx.character.update({
        where: { id: job.characterId },
        data: { gold: { increment: Number(job.goldReward) } },
      });
    }
    return due.length;
  });
}

async function regenerateResources(now: Date): Promise<number> {
  const rows = await prisma.$queryRaw<RegenRow[]>`
    SELECT id, hp, "maxHp", "hpUpdatedAt", energy, "maxEnergy", "energyUpdatedAt"
    FROM "Character"
    WHERE hp < "maxHp" OR energy < "maxEnergy"
    LIMIT ${REGEN_BATCH}
  `;

  let updated = 0;
  for (const row of rows) {
    const hpResult = applyRegen(
      row.hp,
      row.maxHp,
      now.getTime() - new Date(row.hpUpdatedAt).getTime(),
      HP_REGEN_INTERVAL_MS,
    );
    const energyResult = applyRegen(
      row.energy,
      row.maxEnergy,
      now.getTime() - new Date(row.energyUpdatedAt).getTime(),
      ENERGY_REGEN_INTERVAL_MS,
    );
    const hpChanged = hpResult.value !== row.hp;
    const energyChanged = energyResult.value !== row.energy;
    if (!hpChanged && !energyChanged) {
      continue;
    }
    await prisma.character.update({
      where: { id: row.id },
      data: {
        hp: hpResult.value,
        hpUpdatedAt:
          hpResult.value >= row.maxHp
            ? now
            : new Date(new Date(row.hpUpdatedAt).getTime() + hpResult.consumedMs),
        energy: energyResult.value,
        energyUpdatedAt:
          energyResult.value >= row.maxEnergy
            ? now
            : new Date(
                new Date(row.energyUpdatedAt).getTime() + energyResult.consumedMs,
              ),
      },
    });
    updated += 1;
  }
  return updated;
}

let running = false;

async function tick(): Promise<void> {
  if (running) {
    return;
  }
  running = true;
  const now = new Date();
  try {
    const completed = await completeProfessionJobs(now);
    const regenerated = await regenerateResources(now);
    if (completed > 0 || regenerated > 0) {
      console.log(
        `[tick ${now.toISOString()}] jobs=${completed} regen=${regenerated}`,
      );
    }
  } catch (error) {
    console.error("tick error", error);
  } finally {
    running = false;
  }
}

async function main(): Promise<void> {
  console.log("kingdom-rpg worker started");
  await tick();
  setInterval(() => {
    void tick();
  }, TICK_INTERVAL_MS);
}

void main();
