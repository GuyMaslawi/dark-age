export const HP_REGEN_INTERVAL_MS = 20_000;
export const ENERGY_REGEN_INTERVAL_MS = 25_000;

export type RegenResult = {
  value: number;
  consumedMs: number;
};

export function applyRegen(
  current: number,
  max: number,
  elapsedMs: number,
  intervalMs: number,
): RegenResult {
  if (current >= max || elapsedMs <= 0 || intervalMs <= 0) {
    return { value: Math.min(current, max), consumedMs: 0 };
  }
  const gained = Math.floor(elapsedMs / intervalMs);
  if (gained <= 0) {
    return { value: current, consumedMs: 0 };
  }
  const capped = Math.min(max, current + gained);
  const actualGained = capped - current;
  return { value: capped, consumedMs: actualGained * intervalMs };
}
