import type { Character, EquipmentSlot, ItemType, Location, Rarity } from "@kingdom/db";
import { xpProgress, type EffectiveStats } from "@kingdom/game-engine";
import { Portrait } from "@/components/art/Portrait";
import { ItemIcon } from "@/components/art/ItemIcon";
import { SceneBackdrop } from "@/components/scene/SceneBackdrop";
import { EQUIP_SLOTS } from "@/lib/equipment";
import { rarityMeta } from "@/lib/rarity";
import { AllocatePanel } from "./AllocatePanel";

type CharacterWithLocation = Character & { location: Location };

export type EquippedView = {
  slug: string;
  name: string;
  rarity: Rarity;
  type: ItemType;
};

function StatLine({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between border-b border-void-edge/60 py-1.5 text-sm last:border-0">
      <span className="text-neutral-400">{label}</span>
      <span className="font-medium tabular-nums text-gold-bright">{value}</span>
    </div>
  );
}

function EquipSlot({
  label,
  item,
}: {
  label: string;
  item?: EquippedView;
}) {
  const meta = item ? rarityMeta[item.rarity] : null;
  return (
    <div
      className={`flex flex-col items-center gap-1 rounded-lg border p-2 ${
        meta ? meta.border : "border-dashed border-void-edge"
      }`}
    >
      {item ? (
        <ItemIcon slug={item.slug} type={item.type} rarity={item.rarity} name={item.name} size={52} />
      ) : (
        <div className="flex h-[52px] w-[52px] items-center justify-center rounded-lg bg-void-soft text-[10px] text-neutral-600">
          ריק
        </div>
      )}
      <span className={`text-center text-[10px] ${item ? meta?.text : "text-neutral-500"}`}>
        {item ? item.name : label}
      </span>
    </div>
  );
}

export function CharacterSheet({
  character,
  equippedBySlot,
  effective,
}: {
  character: CharacterWithLocation;
  equippedBySlot: Partial<Record<EquipmentSlot, EquippedView>>;
  effective: EffectiveStats;
}) {
  const progress = xpProgress(character);

  const stats = [
    { key: "strength" as const, label: "כוח", hint: "נזק בקרב", value: character.strength },
    { key: "wisdom" as const, label: "בינה", hint: "דיוק הפגיעה", value: character.wisdom },
    { key: "agility" as const, label: "זריזות", hint: "התחמקות", value: character.agility },
    { key: "endurance" as const, label: "סיבולת", hint: "בריאות והפחתת נזק", value: character.endurance },
  ];

  return (
    <SceneBackdrop slug="keep" icon="⚔️" title="הדמות שלך" maxWidth="max-w-4xl">
      <div className="space-y-5">
        <div className="panel flex flex-col gap-5 p-5 sm:flex-row sm:items-center">
          <Portrait
            avatarKey={character.avatarKey}
            gender={character.gender}
            name={character.name}
            size={128}
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h1 className="text-2xl font-bold text-gold">{character.name}</h1>
              <span className="text-sm text-neutral-400">
                רמה {character.level}.{character.subLevel}
              </span>
            </div>
            <p className="mt-1 text-sm text-neutral-500">נמצא ב{character.location.name}</p>

            <div className="mt-4">
              <div className="mb-1 flex items-center justify-between text-xs text-neutral-400">
                <span>ניסיון</span>
                <span className="tabular-nums">
                  {progress.required > 0 ? `${progress.current}/${progress.required}` : "רמה מרבית"}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-void-soft">
                <div className="h-full rounded-full bg-gold" style={{ width: `${progress.percent}%` }} />
              </div>
            </div>
          </div>
        </div>

        <div className="panel p-5">
          <h2 className="mb-4 text-lg font-semibold text-gold">ציוד</h2>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-9">
            {EQUIP_SLOTS.map(({ slot, label }) => (
              <EquipSlot key={slot} label={label} item={equippedBySlot[slot]} />
            ))}
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <AllocatePanel stats={stats} unspentPoints={character.unspentPoints} />

          <div className="panel p-5">
            <h2 className="mb-4 text-lg font-semibold text-gold">מאפיינים בקרב</h2>
            <StatLine label="כוח (עם ציוד)" value={effective.strength} />
            <StatLine label="בינה (עם ציוד)" value={effective.wisdom} />
            <StatLine label="זריזות (עם ציוד)" value={effective.agility} />
            <StatLine label="סיבולת (עם ציוד)" value={effective.endurance} />
            <StatLine label="נזק נשק" value={effective.weaponBase} />
            <StatLine label="שריון" value={effective.armorValue} />
            <div className="mt-3 border-t border-void-edge pt-3">
              <StatLine label="בריאות" value={`${character.hp}/${character.maxHp}`} />
              <StatLine label="אנרגיה" value={`${character.energy}/${character.maxEnergy}`} />
              <StatLine label="זהב" value={character.gold} />
              <StatLine label="ניצחונות PvE" value={character.pveWins} />
              <StatLine label="ניצחונות PvP" value={character.pvpWins} />
            </div>
          </div>
        </div>
      </div>
    </SceneBackdrop>
  );
}
