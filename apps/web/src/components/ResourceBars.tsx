type BarProps = {
  label: string;
  current: number;
  max: number;
  colorClass: string;
};

function Bar({ label, current, max, colorClass }: BarProps) {
  const pct = max > 0 ? Math.min(100, Math.round((current / max) * 100)) : 0;
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
          className={`h-full rounded-full ${colorClass}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

import { xpProgress } from "@kingdom/game-engine";

export type CharacterSummary = {
  name: string;
  level: number;
  subLevel: number;
  hp: number;
  maxHp: number;
  energy: number;
  maxEnergy: number;
  xp: number;
  gold: number;
};

export function ResourceBars({ character }: { character: CharacterSummary }) {
  const xp = xpProgress(character);
  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex items-baseline gap-2">
        <span className="font-semibold text-gold">{character.name}</span>
        <span className="text-xs text-neutral-400">
          רמה {character.level}.{character.subLevel}
        </span>
      </div>
      <Bar
        label="בריאות"
        current={character.hp}
        max={character.maxHp}
        colorClass="bg-blood"
      />
      <Bar
        label="אנרגיה"
        current={character.energy}
        max={character.maxEnergy}
        colorClass="bg-emerald-600"
      />
      <Bar
        label="ניסיון"
        current={xp.current}
        max={xp.required}
        colorClass="bg-gold"
      />
      <div className="flex items-center gap-1 text-sm text-gold">
        <span aria-hidden>🪙</span>
        <span className="tabular-nums">{character.gold}</span>
      </div>
    </div>
  );
}
