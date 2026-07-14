import type { ReactNode } from "react";
import { GameArt } from "@/components/GameArt";
import { LocationScene } from "@/components/art/LocationScene";

export function Scene({
  slug,
  src,
  title,
  subtitle,
  children,
  className,
}: {
  slug: string;
  src: string | null;
  title?: string;
  subtitle?: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`relative min-h-[calc(100dvh-7.5rem)] overflow-hidden rounded-2xl border border-void-edge ${className ?? ""}`}
    >
      <GameArt
        src={src}
        alt={title ?? slug}
        className="absolute inset-0 h-full w-full"
        imgClassName="h-full w-full object-cover"
        fallback={<LocationScene slug={slug} className="absolute inset-0 h-full w-full" />}
      />

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-void via-void/25 to-void/50" />
      <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_140px_40px_rgba(0,0,0,0.7)]" />

      {title && (
        <div className="pointer-events-none absolute inset-x-0 top-0 p-5 text-center">
          <h1 className="text-2xl font-bold tracking-wide text-gold drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1 text-sm text-neutral-200 drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
              {subtitle}
            </p>
          )}
        </div>
      )}

      {children}
    </div>
  );
}
