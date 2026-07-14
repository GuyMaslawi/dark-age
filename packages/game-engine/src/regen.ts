export const HP_REGEN_INTERVAL_MS = 5_000;
export const ENERGY_REGEN_INTERVAL_MS = 25_000;
export const HP_REGEN_PERCENT = 0.1;

export function hpRegenPerTick(maxHp: number): number {
  return Math.max(1, Math.ceil(maxHp * HP_REGEN_PERCENT));
}

export type RegenResult = {
  value: number;
  consumedMs: number;
};

export function applyRegen(
  current: number,
  max: number,
  elapsedMs: number,
  intervalMs: number,
  perTick = 1,
): RegenResult {
  if (current >= max || elapsedMs <= 0 || intervalMs <= 0) {
    return { value: Math.min(current, max), consumedMs: 0 };
  }
  const ticks = Math.floor(elapsedMs / intervalMs);
  if (ticks <= 0) {
    return { value: current, consumedMs: 0 };
  }
  const capped = Math.min(max, current + ticks * Math.max(1, perTick));
  const gained = capped - current;
  const ticksUsed = Math.ceil(gained / Math.max(1, perTick));
  return { value: capped, consumedMs: ticksUsed * intervalMs };
}
