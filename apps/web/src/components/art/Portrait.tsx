import { Avatar } from "@/components/Avatar";
import { GameArt } from "@/components/GameArt";
import { portraitArtSrc, type ArtGender } from "@/lib/art";

export function Portrait({
  avatarKey,
  gender,
  name,
  size = 96,
  rounded = "rounded-xl",
  className,
}: {
  avatarKey: string;
  gender?: ArtGender;
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
        src={portraitArtSrc(avatarKey, gender)}
        alt={name}
        className="h-full w-full"
        fallback={<Avatar avatarKey={avatarKey} gender={gender} size={size} />}
      />
    </div>
  );
}
