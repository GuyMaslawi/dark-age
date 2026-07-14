import type { ReactElement } from "react";
import { locationTheme, type LocationMotif } from "@/lib/art";

function motifLayers(motif: LocationMotif, ground: string, accent: string): ReactElement {
  switch (motif) {
    case "forest":
      return (
        <g>
          <path d="M0 150 L0 118 L20 128 L40 108 L62 126 L84 104 L108 124 L134 106 L160 126 L184 110 L200 122 L200 150 Z" fill={ground} />
          {[18, 52, 96, 140, 176].map((x, i) => (
            <path key={i} d={`M${x} 120 l7 -46 l7 46 Z`} fill="#0c110d" opacity="0.9" />
          ))}
          <circle cx="150" cy="34" r="16" fill={accent} opacity="0.16" />
        </g>
      );
    case "marsh":
      return (
        <g>
          <ellipse cx="100" cy="140" rx="120" ry="24" fill={accent} opacity="0.1" />
          <path d="M0 150 L0 130 Q50 122 100 132 Q150 142 200 128 L200 150 Z" fill={ground} />
          {[30, 80, 130, 170].map((x, i) => (
            <path key={i} d={`M${x} 132 q-2 -20 2 -30 q6 12 2 30`} stroke="#1e2a17" strokeWidth="2" fill="none" opacity="0.8" />
          ))}
        </g>
      );
    case "cave":
      return (
        <g>
          <path d="M0 0 L0 40 L22 20 L44 44 L70 18 L96 42 L128 16 L160 42 L186 20 L200 40 L200 0 Z" fill="#0b0908" />
          <path d="M0 150 L0 120 L30 128 L70 116 L120 130 L170 118 L200 126 L200 150 Z" fill={ground} />
          <circle cx="150" cy="60" r="12" fill={accent} opacity="0.18" />
        </g>
      );
    case "desert":
      return (
        <g>
          <circle cx="150" cy="46" r="22" fill={accent} opacity="0.2" />
          <path d="M0 150 L0 128 Q60 108 120 126 Q160 138 200 120 L200 150 Z" fill={ground} />
          <path d="M0 150 L0 140 Q80 126 200 142 L200 150 Z" fill="#000" opacity="0.25" />
        </g>
      );
    case "peaks":
      return (
        <g>
          <path d="M0 150 L0 96 L40 40 L74 92 L104 54 L140 104 L168 66 L200 108 L200 150 Z" fill={ground} />
          <path d="M40 40 L54 62 L26 62 Z M104 54 L118 78 L90 78 Z" fill="#dfeef4" opacity="0.5" />
          <circle cx="150" cy="32" r="14" fill={accent} opacity="0.16" />
        </g>
      );
    case "ruins":
      return (
        <g>
          <path d="M0 150 L0 118 L20 118 L20 90 L34 90 L34 118 L54 118 L54 70 L70 70 L70 118 L120 118 L120 96 L138 96 L138 118 L200 118 L200 150 Z" fill={ground} />
          {[54, 120].map((x, i) => (
            <rect key={i} x={x + 4} y={i === 0 ? 70 : 96} width="10" height="6" fill={accent} opacity="0.25" />
          ))}
        </g>
      );
    case "abyss":
    default:
      return (
        <g>
          <ellipse cx="100" cy="150" rx="90" ry="40" fill="#000" />
          <path d="M0 150 L0 110 L36 120 L72 100 L108 122 L150 102 L200 118 L200 150 Z" fill={ground} />
          <circle cx="100" cy="70" r="30" fill={accent} opacity="0.12" />
          <circle cx="100" cy="70" r="16" fill={accent} opacity="0.16" />
        </g>
      );
  }
}

export function LocationScene({
  slug,
  className,
  children,
}: {
  slug: string;
  className?: string;
  children?: React.ReactNode;
}) {
  const theme = locationTheme[slug] ?? {
    sky: ["#1a1a1f", "#0b0b0e"] as [string, string],
    ground: "#16161a",
    accent: "#c9a227",
    motif: "forest" as LocationMotif,
  };

  return (
    <div className={`relative overflow-hidden ${className ?? ""}`}>
      <svg
        viewBox="0 0 200 150"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
        aria-hidden
      >
        <defs>
          <linearGradient id={`ls-sky-${slug}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={theme.sky[0]} />
            <stop offset="100%" stopColor={theme.sky[1]} />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="200" height="150" fill={`url(#ls-sky-${slug})`} />
        {motifLayers(theme.motif, theme.ground, theme.accent)}
        <rect x="0" y="0" width="200" height="150" fill="#000" opacity="0.15" />
      </svg>
      {children}
    </div>
  );
}
