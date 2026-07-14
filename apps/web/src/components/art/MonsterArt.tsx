import { GameArt } from "@/components/GameArt";
import { monsterArtSrc } from "@/lib/art";
import { MonsterSigil } from "./MonsterSigil";

export function MonsterArt({
  slug,
  name,
  size = 96,
  rounded = "rounded-xl",
  className,
}: {
  slug: string;
  name: string;
  size?: number;
  rounded?: string;
  className?: string;
}) {
  return (
    <div
      className={`relative shrink-0 overflow-hidden ${rounded} ${className ?? ""}`}
      style={{ width: size, height: size }}
    >
      <GameArt
        src={monsterArtSrc(slug)}
        alt={name}
        className="h-full w-full"
        fallback={<MonsterSigil slug={slug} name={name} size={size} />}
      />
    </div>
  );
}
