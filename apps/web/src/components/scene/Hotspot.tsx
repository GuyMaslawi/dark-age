import Link from "next/link";
import type { ReactNode } from "react";

export function HotspotAt({
  x,
  y,
  children,
  className,
}: {
  x: number;
  y: number;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`absolute z-10 -translate-x-1/2 -translate-y-1/2 ${className ?? ""}`}
      style={{ left: `${x}%`, top: `${y}%` }}
    >
      {children}
    </div>
  );
}

export function HotspotFrame({
  label,
  sublabel,
  icon,
  art,
  tone = "#c9a227",
  size = 84,
  disabled = false,
  active = false,
}: {
  label: string;
  sublabel?: string;
  icon?: string;
  art?: ReactNode;
  tone?: string;
  size?: number;
  disabled?: boolean;
  active?: boolean;
}) {
  return (
    <span className="flex flex-col items-center gap-1.5">
      <span
        className={`relative flex items-center justify-center overflow-hidden rounded-2xl border backdrop-blur-sm transition-all duration-200 ${
          disabled
            ? "opacity-45 grayscale"
            : "group-hover:-translate-y-1 group-hover:scale-105"
        }`}
        style={{
          width: size,
          height: size,
          borderColor: `${tone}${active ? "" : "88"}`,
          background: `radial-gradient(circle at 50% 30%, ${tone}22, rgba(8,8,10,0.72) 78%)`,
          boxShadow: active
            ? `0 0 26px -4px ${tone}, inset 0 0 0 1px ${tone}`
            : `0 6px 20px rgba(0,0,0,0.55)`,
        }}
      >
        {art ?? (
          <span aria-hidden className="text-3xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            {icon}
          </span>
        )}
        {!disabled && (
          <span
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
            style={{ boxShadow: `inset 0 0 22px -2px ${tone}, 0 0 24px -6px ${tone}` }}
          />
        )}
      </span>
      <span className="flex flex-col items-center leading-tight">
        <span className="rounded-md bg-void/75 px-2 py-0.5 text-xs font-semibold text-gold-bright drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
          {label}
        </span>
        {sublabel && (
          <span className="mt-0.5 rounded bg-void/60 px-1.5 text-[10px] text-neutral-300">
            {sublabel}
          </span>
        )}
      </span>
    </span>
  );
}

export function Hotspot({
  x,
  y,
  href,
  label,
  sublabel,
  icon,
  art,
  tone,
  size,
}: {
  x: number;
  y: number;
  href: string;
  label: string;
  sublabel?: string;
  icon?: string;
  art?: ReactNode;
  tone?: string;
  size?: number;
}) {
  return (
    <HotspotAt x={x} y={y}>
      <Link href={href} className="group block cursor-pointer outline-none">
        <HotspotFrame
          label={label}
          sublabel={sublabel}
          icon={icon}
          art={art}
          tone={tone}
          size={size}
        />
      </Link>
    </HotspotAt>
  );
}
