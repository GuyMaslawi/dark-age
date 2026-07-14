import type { ItemType, Rarity } from "@kingdom/db";
import { rarityMeta } from "@/lib/rarity";
import { ItemIcon } from "@/components/art/ItemIcon";

export type ItemStats = {
  strengthBonus: number;
  wisdomBonus: number;
  agilityBonus: number;
  enduranceBonus: number;
  weaponBase: number;
  armorValue: number;
};

export function itemBonusLines(stats: ItemStats): string[] {
  const lines: string[] = [];
  if (stats.weaponBase > 0) lines.push(`נזק +${stats.weaponBase}`);
  if (stats.armorValue > 0) lines.push(`שריון +${stats.armorValue}`);
  if (stats.strengthBonus > 0) lines.push(`כוח +${stats.strengthBonus}`);
  if (stats.wisdomBonus > 0) lines.push(`בינה +${stats.wisdomBonus}`);
  if (stats.agilityBonus > 0) lines.push(`זריזות +${stats.agilityBonus}`);
  if (stats.enduranceBonus > 0) lines.push(`סיבולת +${stats.enduranceBonus}`);
  return lines;
}

export type ItemRequirements = {
  strength: number;
  wisdom: number;
  agility: number;
  endurance: number;
};

const REQ_LABELS: { key: keyof ItemRequirements; label: string }[] = [
  { key: "strength", label: "כוח" },
  { key: "wisdom", label: "בינה" },
  { key: "agility", label: "זריזות" },
  { key: "endurance", label: "סיבולת" },
];

export function ItemCard({
  name,
  rarity,
  type,
  slug,
  levelRequirement,
  stats,
  description,
  meetsLevel = true,
  requirements,
  unmetReqs,
  children,
}: {
  name: string;
  rarity: Rarity;
  type: ItemType;
  slug?: string;
  levelRequirement: number;
  stats: ItemStats;
  description?: string;
  meetsLevel?: boolean;
  requirements?: ItemRequirements;
  unmetReqs?: string[];
  children?: React.ReactNode;
}) {
  const meta = rarityMeta[rarity];
  const lines = itemBonusLines(stats);
  const unmet = new Set(unmetReqs ?? []);
  const levelUnmet = unmet.has("level") || !meetsLevel;
  const statReqs = REQ_LABELS.filter((r) => (requirements?.[r.key] ?? 0) > 0);
  return (
    <div className={`panel flex gap-3 border p-3 ${meta.border}`}>
      <ItemIcon slug={slug} type={type} rarity={rarity} name={name} size={56} />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <span className={`font-semibold ${meta.text}`}>{name}</span>
          <span className="shrink-0 text-[11px] text-neutral-500">{meta.label}</span>
        </div>
        {lines.length > 0 && (
          <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-neutral-300">
            {lines.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </div>
        )}
        {description && <p className="text-[11px] text-neutral-500">{description}</p>}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px]">
          <span className="text-neutral-500">דרישות:</span>
          <span className={levelUnmet ? "font-semibold text-red-400" : "text-neutral-400"}>
            רמה {levelRequirement}
          </span>
          {statReqs.map((r) => (
            <span
              key={r.key}
              className={unmet.has(r.key) ? "font-semibold text-red-400" : "text-neutral-400"}
            >
              {r.label} {requirements?.[r.key]}
            </span>
          ))}
        </div>
        <div className="mt-auto flex items-center justify-end gap-2">{children}</div>
      </div>
    </div>
  );
}
