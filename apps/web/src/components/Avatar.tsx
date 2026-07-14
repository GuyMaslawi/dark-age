import { avatarFor, avatarOptions } from "@/lib/avatars";

type AvatarProps = {
  avatarKey: string;
  gender?: "MALE" | "FEMALE";
  size?: number;
  className?: string;
};

function emblem(index: number, accent: string) {
  switch (index % 6) {
    case 0:
      return <circle cx="50" cy="66" r="6" fill={accent} />;
    case 1:
      return <path d="M50 60 L57 72 L43 72 Z" fill={accent} />;
    case 2:
      return <path d="M50 59 L58 66 L50 73 L42 66 Z" fill={accent} />;
    case 3:
      return <path d="M46 60 h8 v4 h4 v4 h-4 v4 h-8 v-4 h-4 v-4 h4 Z" fill={accent} />;
    case 4:
      return (
        <path
          d="M50 59 l2.4 5 5.4.6 -4 3.7 1.1 5.3 -4.9 -2.8 -4.9 2.8 1.1 -5.3 -4 -3.7 5.4 -.6 Z"
          fill={accent}
        />
      );
    default:
      return <rect x="45" y="61" width="10" height="10" rx="1.5" fill={accent} />;
  }
}

export function Avatar({ avatarKey, gender = "MALE", size = 96, className }: AvatarProps) {
  const option = avatarFor(avatarKey);
  const index = avatarOptions.findIndex((o) => o.key === avatarKey);
  const hoodPath =
    gender === "FEMALE"
      ? "M25 52 Q50 6 75 52 Q72 60 68 62 Q50 40 32 62 Q28 60 25 52 Z"
      : "M27 50 Q50 12 73 50 Q70 58 66 60 Q50 42 34 60 Q30 58 27 50 Z";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role="img"
      aria-label={`אווטאר ${option.label}`}
      className={className}
    >
      <defs>
        <linearGradient id={`bg-${avatarKey}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1a1a1d" />
          <stop offset="100%" stopColor="#0c0c0e" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="100" height="100" rx="12" fill={`url(#bg-${avatarKey})`} />
      <rect x="0.5" y="0.5" width="99" height="99" rx="12" fill="none" stroke={option.accent} strokeOpacity="0.35" />
      <path d="M18 100 Q50 66 82 100 Z" fill="#17171a" />
      <ellipse cx="50" cy="52" rx="13" ry="16" fill="#2a2622" />
      <path d={hoodPath} fill="#141416" stroke={option.accent} strokeOpacity="0.5" strokeWidth="1.5" />
      <circle cx="45" cy="50" r="1.6" fill={option.accent} />
      <circle cx="55" cy="50" r="1.6" fill={option.accent} />
      {emblem(index, option.accent)}
    </svg>
  );
}
