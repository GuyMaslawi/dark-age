"use client";

import { useEffect, useState } from "react";
import {
  xpProgress,
  hpRegenPerTick,
  HP_REGEN_INTERVAL_MS,
  ENERGY_REGEN_INTERVAL_MS,
} from "@kingdom/game-engine";

export type LiveCharacter = {
  name: string;
  level: number;
  subLevel: number;
  hp: number;
  maxHp: number;
  hpUpdatedAt: string;
  energy: number;
  maxEnergy: number;
  energyUpdatedAt: string;
  xp: number;
  gold: number;
};

function projected(
  base: number,
  max: number,
  updatedAtMs: number,
  intervalMs: number,
  perTick: number,
  now: number,
): number {
  if (base >= max) return max;
  const elapsed = now - updatedAtMs;
  if (elapsed <= 0) return base;
  const ticks = Math.floor(elapsed / intervalMs);
  if (ticks <= 0) return base;
  return Math.min(max, base + ticks * perTick);
}

function Bar({
  label,
  current,
  max,
  colorClass,
}: {
  label: string;
  current: number;
  max: number;
  colorClass: string;
}) {
  const pct = max > 0 ? Math.min(100, (current / max) * 100) : 0;
  return (
    <div className="min-w-[120px] flex-1">
      <div className="mb-1 flex items-center justify-between text-xs text-neutral-400">
        <span>{label}</span>
        <span className="tabular-nums">
          {current}/{max}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-void-soft">
        <div
          className={`h-full rounded-full ${colorClass} transition-[width] duration-700 ease-linear`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function LiveResourceBars({ character }: { character: LiveCharacter }) {
  const [now, setNow] = useState(() => {
    const hp = new Date(character.hpUpdatedAt).getTime();
    const energy = new Date(character.energyUpdatedAt).getTime();
    return Math.max(hp, energy);
  });

  useEffect(() => {
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hp = projected(
    character.hp,
    character.maxHp,
    new Date(character.hpUpdatedAt).getTime(),
    HP_REGEN_INTERVAL_MS,
    hpRegenPerTick(character.maxHp),
    now,
  );
  const energy = projected(
    character.energy,
    character.maxEnergy,
    new Date(character.energyUpdatedAt).getTime(),
    ENERGY_REGEN_INTERVAL_MS,
    1,
    now,
  );

  const xp = xpProgress(character);

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex items-baseline gap-2">
        <span className="font-semibold text-gold">{character.name}</span>
        <span className="text-xs text-neutral-400">
          רמה {character.level}.{character.subLevel}
        </span>
      </div>
      <Bar label="בריאות" current={hp} max={character.maxHp} colorClass="bg-blood" />
      <Bar label="אנרגיה" current={energy} max={character.maxEnergy} colorClass="bg-emerald-600" />
      <Bar label="ניסיון" current={xp.current} max={xp.required} colorClass="bg-gold" />
      <div className="flex items-center gap-1 text-sm text-gold">
        <span aria-hidden>🪙</span>
        <span className="tabular-nums">{character.gold}</span>
      </div>
    </div>
  );
}
