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

export function ItemCard({
  name,
  rarity,
  type,
  slug,
  levelRequirement,
  stats,
  description,
  meetsLevel = true,
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
  children?: React.ReactNode;
}) {
  const meta = rarityMeta[rarity];
  const lines = itemBonusLines(stats);
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
        <div className="mt-auto flex items-center justify-between gap-2">
          <span
            className={`text-[11px] ${meetsLevel ? "text-neutral-500" : "text-red-400"}`}
          >
            דרישת רמה: {levelRequirement}
          </span>
          {children}
        </div>
      </div>
    </div>
  );
}
