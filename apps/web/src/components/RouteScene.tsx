"use client";

import { usePathname } from "next/navigation";
import { GameArt } from "@/components/GameArt";
import { LocationScene } from "@/components/art/LocationScene";
import { locationArtSrc } from "@/lib/art";

const ROUTE_SLUG: Record<string, string> = {
  "/character": "keep",
  "/inventory": "keep",
  "/market": "market",
  "/professions": "forge",
  "/clan": "keep",
  "/ranking": "throne",
  "/chat": "tavern",
  "/battles": "arena",
};

function slugForPath(pathname: string): string | null {
  for (const [route, slug] of Object.entries(ROUTE_SLUG)) {
    if (pathname === route || pathname.startsWith(`${route}/`)) return slug;
  }
  return null;
}

export function RouteScene() {
  const pathname = usePathname();
  const slug = slugForPath(pathname);
  if (!slug) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-0" aria-hidden>
      <GameArt
        src={locationArtSrc(slug)}
        alt=""
        className="absolute inset-0 h-full w-full"
        imgClassName="h-full w-full object-cover"
        fallback={<LocationScene slug={slug} className="absolute inset-0 h-full w-full" />}
      />
      <div className="absolute inset-0 bg-void/78" />
      <div className="absolute inset-0 bg-gradient-to-b from-void/50 via-void/70 to-void" />
    </div>
  );
}
