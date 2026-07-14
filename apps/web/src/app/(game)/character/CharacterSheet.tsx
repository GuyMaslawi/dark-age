import type { Character, Location } from "@kingdom/db";
import { xpProgress } from "@kingdom/game-engine";
import { Portrait } from "@/components/art/Portrait";
import { SceneBackdrop } from "@/components/scene/SceneBackdrop";
import { AllocatePanel } from "./AllocatePanel";

type CharacterWithLocation = Character & { location: Location };

function StatLine({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between border-b border-void-edge/60 py-1.5 text-sm last:border-0">
      <span className="text-neutral-400">{label}</span>
      <span className="font-medium tabular-nums text-gold-bright">{value}</span>
    </div>
  );
}

export function CharacterSheet({ character }: { character: CharacterWithLocation }) {
  const progress = xpProgress(character);

  const stats = [
    { key: "strength" as const, label: "כוח", hint: "נזק בקרב", value: character.strength },
    { key: "wisdom" as const, label: "בינה", hint: "דיוק הפגיעה", value: character.wisdom },
    { key: "agility" as const, label: "זריזות", hint: "התחמקות", value: character.agility },
    { key: "endurance" as const, label: "סיבולת", hint: "בריאות והפחתת נזק", value: character.endurance },
  ];

  return (
    <SceneBackdrop slug="town" icon="⚔️" title="הדמות שלך" maxWidth="max-w-3xl">
      <div className="space-y-5">
      <div className="panel flex flex-col gap-5 p-5 sm:flex-row sm:items-center">
        <Portrait
          avatarKey={character.avatarKey}
          gender={character.gender}
          name={character.name}
          size={112}
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h1 className="text-2xl font-bold text-gold">{character.name}</h1>
            <span className="text-sm text-neutral-400">
              רמה {character.level}.{character.subLevel}
            </span>
          </div>
          <p className="mt-1 text-sm text-neutral-500">
            נמצא ב{character.location.name}
          </p>

          <div className="mt-4">
            <div className="mb-1 flex items-center justify-between text-xs text-neutral-400">
              <span>ניסיון</span>
              <span className="tabular-nums">
                {progress.required > 0
                  ? `${progress.current}/${progress.required}`
                  : "רמה מרבית"}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-void-soft">
              <div
                className="h-full rounded-full bg-gold"
                style={{ width: `${progress.percent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <AllocatePanel stats={stats} unspentPoints={character.unspentPoints} />

        <div className="panel p-5">
          <h2 className="mb-4 text-lg font-semibold text-gold">סיכום</h2>
          <StatLine label="בריאות" value={`${character.hp}/${character.maxHp}`} />
          <StatLine label="אנרגיה" value={`${character.energy}/${character.maxEnergy}`} />
          <StatLine label="זהב" value={character.gold} />
          <StatLine label="ניצחונות PvE" value={character.pveWins} />
          <StatLine label="ניצחונות PvP" value={character.pvpWins} />
          <StatLine label="הפסדי PvP" value={character.pvpLosses} />
        </div>
      </div>
      </div>
    </SceneBackdrop>
  );
}
