import type { Prisma } from "@kingdom/db";
import {
  applyRegen,
  hpRegenPerTick,
  HP_REGEN_INTERVAL_MS,
  ENERGY_REGEN_INTERVAL_MS,
} from "@kingdom/game-engine";

export type RegenSource = {
  id: string;
  hp: number;
  maxHp: number;
  hpUpdatedAt: Date;
  energy: number;
  maxEnergy: number;
  energyUpdatedAt: Date;
};

export type RegenState = {
  hp: number;
  energy: number;
  hpUpdatedAt: Date;
  energyUpdatedAt: Date;
  changed: boolean;
};

export function computeRegen(source: RegenSource, now: Date): RegenState {
  const hpElapsed = now.getTime() - source.hpUpdatedAt.getTime();
  const hpResult = applyRegen(
    source.hp,
    source.maxHp,
    hpElapsed,
    HP_REGEN_INTERVAL_MS,
    hpRegenPerTick(source.maxHp),
  );
  const energyElapsed = now.getTime() - source.energyUpdatedAt.getTime();
  const energyResult = applyRegen(
    source.energy,
    source.maxEnergy,
    energyElapsed,
    ENERGY_REGEN_INTERVAL_MS,
  );

  const hpUpdatedAt =
    hpResult.value >= source.maxHp
      ? now
      : new Date(source.hpUpdatedAt.getTime() + hpResult.consumedMs);
  const energyUpdatedAt =
    energyResult.value >= source.maxEnergy
      ? now
      : new Date(source.energyUpdatedAt.getTime() + energyResult.consumedMs);

  return {
    hp: hpResult.value,
    energy: energyResult.value,
    hpUpdatedAt,
    energyUpdatedAt,
    changed: hpResult.value !== source.hp || energyResult.value !== source.energy,
  };
}

export function withRegen<T extends RegenSource>(source: T, now: Date): T {
  const regen = computeRegen(source, now);
  return {
    ...source,
    hp: regen.hp,
    energy: regen.energy,
    hpUpdatedAt: regen.hpUpdatedAt,
    energyUpdatedAt: regen.energyUpdatedAt,
  };
}

export async function syncRegen(
  tx: Prisma.TransactionClient,
  character: RegenSource,
  now: Date,
): Promise<void> {
  const regen = computeRegen(character, now);
  if (!regen.changed) {
    return;
  }
  await tx.character.update({
    where: { id: character.id },
    data: {
      hp: regen.hp,
      energy: regen.energy,
      hpUpdatedAt: regen.hpUpdatedAt,
      energyUpdatedAt: regen.energyUpdatedAt,
    },
  });
  character.hp = regen.hp;
  character.energy = regen.energy;
  character.hpUpdatedAt = regen.hpUpdatedAt;
  character.energyUpdatedAt = regen.energyUpdatedAt;
}
