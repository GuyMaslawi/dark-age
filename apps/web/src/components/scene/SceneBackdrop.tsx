import type { ReactNode } from "react";
import { GameArt } from "@/components/GameArt";
import { LocationScene } from "@/components/art/LocationScene";
import { locationArtSrc } from "@/lib/art";

export function SceneBackdrop({
  slug,
  title,
  subtitle,
  icon,
  children,
  maxWidth = "max-w-4xl",
}: {
  slug: string;
  title: string;
  subtitle?: string;
  icon?: string;
  children: ReactNode;
  maxWidth?: string;
}) {
  return (
    <div className="relative -m-4 min-h-[calc(100dvh-3.75rem)] md:-m-6">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <GameArt
          src={locationArtSrc(slug)}
          alt={title}
          className="h-full w-full opacity-40 blur-[2px]"
          imgClassName="h-full w-full object-cover"
          fallback={<LocationScene slug={slug} className="h-full w-full" />}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-void/85 via-void/80 to-void" />
      </div>

      <div className={`relative z-10 mx-auto ${maxWidth} p-4 md:p-6`}>
        <header className="mb-6 flex items-center gap-3">
          {icon && (
            <span
              aria-hidden
              className="flex h-12 w-12 items-center justify-center rounded-xl border border-gold/30 bg-void/70 text-2xl"
            >
              {icon}
            </span>
          )}
          <div>
            <h1 className="text-2xl font-bold text-gold drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
              {title}
            </h1>
            {subtitle && <p className="mt-0.5 text-sm text-neutral-300">{subtitle}</p>}
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}
