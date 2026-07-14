import type { ItemType, Rarity } from "@kingdom/db";
import { GameArt } from "@/components/GameArt";
import { itemArtSrc, rarityRing } from "@/lib/art";
import { ItemGlyph } from "./ItemGlyph";

export function ItemIcon({
  slug,
  type,
  rarity,
  name,
  size = 56,
  className,
}: {
  slug?: string | null;
  type: ItemType;
  rarity: Rarity;
  name: string;
  size?: number;
  className?: string;
}) {
  const ring = rarityRing[rarity];
  const fallback = (
    <div
      className="flex h-full w-full items-center justify-center"
      style={{
        color: ring,
        background: `radial-gradient(circle at 50% 35%, ${ring}22, #0c0c0e 72%)`,
      }}
    >
      <ItemGlyph type={type} size={Math.round(size * 0.5)} />
    </div>
  );

  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-lg ${className ?? ""}`}
      style={{ width: size, height: size, boxShadow: `inset 0 0 0 1.5px ${ring}66` }}
    >
      <GameArt
        src={itemArtSrc(slug)}
        alt={name}
        className="h-full w-full"
        fallback={fallback}
      />
    </div>
  );
}
