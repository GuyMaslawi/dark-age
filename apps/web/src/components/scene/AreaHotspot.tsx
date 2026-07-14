import Link from "next/link";

export type Area = {
  href: string;
  label: string;
  sublabel?: string;
  tone?: string;
  x: number;
  y: number;
  w: number;
  h: number;
};

export function AreaHotspot({ area }: { area: Area }) {
  const tone = area.tone ?? "#c9a227";
  return (
    <Link
      href={area.href}
      aria-label={area.label}
      className="group absolute block cursor-pointer outline-none"
      style={{
        left: `${area.x}%`,
        top: `${area.y}%`,
        width: `${area.w}%`,
        height: `${area.h}%`,
        ["--tone" as string]: tone,
      }}
    >
      <span
        aria-hidden
        className="absolute inset-0 animate-breathe rounded-[28%] mix-blend-soft-light transition-all duration-300 group-hover:opacity-100 group-focus-visible:opacity-100"
        style={{
          background:
            "radial-gradient(ellipse at 50% 55%, var(--tone) 0%, rgba(0,0,0,0) 62%)",
        }}
      />

      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[26%] opacity-0 transition-all duration-300 group-hover:opacity-100 group-focus-visible:opacity-100"
        style={{
          background:
            "radial-gradient(ellipse at 50% 55%, color-mix(in srgb, var(--tone) 32%, transparent) 0%, rgba(0,0,0,0) 60%)",
          boxShadow:
            "inset 0 0 46px -10px var(--tone), 0 0 30px -14px var(--tone)",
        }}
      />

      <span className="pointer-events-none absolute inset-x-0 bottom-3 flex translate-y-1 flex-col items-center gap-0.5 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
        <span
          className="rounded-md px-3 py-1 text-sm font-bold tracking-wide text-white"
          style={{
            textShadow: "0 1px 6px rgba(0,0,0,0.95)",
          }}
        >
          {area.label}
        </span>
        {area.sublabel && (
          <span
            className="text-[11px] text-neutral-200"
            style={{ textShadow: "0 1px 5px rgba(0,0,0,0.95)" }}
          >
            {area.sublabel}
          </span>
        )}
      </span>
    </Link>
  );
}
