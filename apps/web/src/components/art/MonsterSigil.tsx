import type { ReactElement } from "react";

function hash(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const accents = ["#c9552e", "#8b1e1e", "#5a8c4f", "#3b6fb3", "#7a4fa8", "#b07a4a", "#7fc2d8", "#9a7fc2"];

function horns(variant: number, color: string): ReactElement {
  switch (variant) {
    case 0:
      return (
        <g fill={color} opacity="0.9">
          <path d="M34 40 Q26 22 30 12 Q36 24 40 38 Z" />
          <path d="M66 40 Q74 22 70 12 Q64 24 60 38 Z" />
        </g>
      );
    case 1:
      return (
        <g fill={color} opacity="0.9">
          <path d="M36 38 Q24 30 20 18 Q34 26 42 36 Z" />
          <path d="M64 38 Q76 30 80 18 Q66 26 58 36 Z" />
        </g>
      );
    case 2:
      return (
        <g fill={color} opacity="0.9">
          <path d="M38 36 Q34 18 42 8 Q44 22 46 34 Z" />
          <path d="M62 36 Q66 18 58 8 Q56 22 54 34 Z" />
          <path d="M50 34 L47 14 L53 14 Z" />
        </g>
      );
    default:
      return (
        <g fill={color} opacity="0.85">
          <path d="M30 42 Q20 34 22 24 Q32 30 38 40 Z" />
          <path d="M70 42 Q80 34 78 24 Q68 30 62 40 Z" />
        </g>
      );
  }
}

function maw(variant: number, color: string): ReactElement {
  if (variant === 0) {
    return (
      <g stroke={color} strokeWidth="2" fill="none" opacity="0.8">
        <path d="M40 66 Q50 74 60 66" />
        <path d="M44 66 L46 71 M50 67 L50 73 M56 66 L54 71" />
      </g>
    );
  }
  if (variant === 1) {
    return (
      <path d="M40 64 Q50 60 60 64 L56 72 L52 66 L48 72 Z" fill={color} opacity="0.75" />
    );
  }
  return (
    <g stroke={color} strokeWidth="2.4" fill="none" opacity="0.75" strokeLinecap="round">
      <path d="M41 66 Q50 72 59 66" />
    </g>
  );
}

export function MonsterSigil({
  slug,
  name,
  accent,
  size = 96,
  className,
}: {
  slug: string;
  name: string;
  accent?: string;
  size?: number;
  className?: string;
}) {
  const h = hash(slug);
  const color = accent ?? accents[h % accents.length] ?? "#c9552e";
  const hornVariant = (h >> 3) % 4;
  const mawVariant = (h >> 6) % 3;
  const eyeY = 50 + ((h >> 9) % 5);
  const eyeSpread = 12 + ((h >> 12) % 6);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role="img"
      aria-label={name}
      className={className}
    >
      <defs>
        <radialGradient id={`ms-bg-${slug}`} cx="50%" cy="40%" r="70%">
          <stop offset="0%" stopColor="#1c1a1e" />
          <stop offset="100%" stopColor="#08080a" />
        </radialGradient>
        <radialGradient id={`ms-eye-${slug}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff" />
          <stop offset="35%" stopColor={color} />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect x="0" y="0" width="100" height="100" rx="14" fill={`url(#ms-bg-${slug})`} />
      <rect x="1" y="1" width="98" height="98" rx="14" fill="none" stroke={color} strokeOpacity="0.3" />
      <ellipse cx="50" cy="58" rx="26" ry="30" fill="#000" opacity="0.35" />
      {horns(hornVariant, color)}
      <circle cx={50 - eyeSpread} cy={eyeY} r="9" fill={`url(#ms-eye-${slug})`} />
      <circle cx={50 + eyeSpread} cy={eyeY} r="9" fill={`url(#ms-eye-${slug})`} />
      <circle cx={50 - eyeSpread} cy={eyeY} r="2.4" fill="#0a0a0a" />
      <circle cx={50 + eyeSpread} cy={eyeY} r="2.4" fill="#0a0a0a" />
      {maw(mawVariant, color)}
    </svg>
  );
}
