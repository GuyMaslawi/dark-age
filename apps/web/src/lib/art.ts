import type { ItemType, Rarity } from "@kingdom/db";

export type ArtGender = "MALE" | "FEMALE";

const ART_ROOT = "/art";

export function monsterArtSrc(slug: string | null | undefined): string | null {
  return slug ? `${ART_ROOT}/monsters/${slug}.png` : null;
}

export function locationArtSrc(slug: string | null | undefined): string | null {
  return slug ? `${ART_ROOT}/locations/${slug}.png` : null;
}

export function itemArtSrc(slug: string | null | undefined): string | null {
  return slug ? `${ART_ROOT}/items/${slug}.png` : null;
}

export function portraitArtSrc(
  avatarKey: string | null | undefined,
  gender: ArtGender | null | undefined,
): string | null {
  if (!avatarKey) return null;
  const g = (gender ?? "MALE").toLowerCase();
  return `${ART_ROOT}/portraits/${avatarKey}-${g}.png`;
}

export const rarityGlow: Record<Rarity, string> = {
  COMMON: "shadow-[0_0_16px_-4px_rgba(184,184,184,0.4)]",
  UNCOMMON: "shadow-[0_0_18px_-4px_rgba(76,175,80,0.55)]",
  RARE: "shadow-[0_0_18px_-4px_rgba(59,130,246,0.6)]",
  EPIC: "shadow-[0_0_20px_-3px_rgba(168,85,247,0.65)]",
  LEGENDARY: "shadow-[0_0_26px_-2px_rgba(245,158,11,0.75)]",
};

export const rarityRing: Record<Rarity, string> = {
  COMMON: "#6b6b6b",
  UNCOMMON: "#4caf50",
  RARE: "#3b82f6",
  EPIC: "#a855f7",
  LEGENDARY: "#f59e0b",
};

export const itemTypeGlyph: Record<ItemType, string> = {
  WEAPON: "weapon",
  SHIELD: "shield",
  HELMET: "helmet",
  ARMOR: "armor",
  PANTS: "pants",
  GLOVES: "gloves",
  BOOTS: "boots",
  RING: "ring",
  MATERIAL: "material",
  CONSUMABLE: "consumable",
};

export const locationTheme: Record<
  string,
  { sky: [string, string]; ground: string; accent: string; motif: LocationMotif }
> = {
  "misty-vale": { sky: ["#26332b", "#141c19"], ground: "#1b241f", accent: "#6fae7e", motif: "forest" },
  "shadow-forest": { sky: ["#1a1f2a", "#0d1016"], ground: "#141821", accent: "#5a6a8c", motif: "forest" },
  "rot-marshes": { sky: ["#232a1c", "#121611"], ground: "#1a2015", accent: "#8aae57", motif: "marsh" },
  "fallen-mines": { sky: ["#241d1a", "#120e0c"], ground: "#1c1613", accent: "#b07a4a", motif: "cave" },
  "ash-desert": { sky: ["#332822", "#1a130f"], ground: "#241a13", accent: "#d08a4a", motif: "desert" },
  "frost-ridge": { sky: ["#20303a", "#0e161c"], ground: "#182630", accent: "#7fc2d8", motif: "peaks" },
  "eternal-ruins": { sky: ["#262232", "#100e16"], ground: "#1c1826", accent: "#9a7fc2", motif: "ruins" },
  "abyss-of-darkness": { sky: ["#1a1424", "#080610"], ground: "#130f1c", accent: "#7a4fa8", motif: "abyss" },
  town: { sky: ["#2a2118", "#14100b"], ground: "#1e1811", accent: "#d0a24a", motif: "ruins" },
  keep: { sky: ["#20222c", "#0e0f14"], ground: "#181a22", accent: "#9aa7c2", motif: "ruins" },
  forge: { sky: ["#2e1c14", "#160c08"], ground: "#211008", accent: "#e0873b", motif: "cave" },
  market: { sky: ["#2b2416", "#15110a"], ground: "#1f1a0f", accent: "#c9a227", motif: "ruins" },
  tavern: { sky: ["#2a1f16", "#150f0a"], ground: "#1e150d", accent: "#c9552e", motif: "cave" },
  throne: { sky: ["#241f2e", "#100e16"], ground: "#1a1524", accent: "#f59e0b", motif: "ruins" },
  arena: { sky: ["#241618", "#12090a"], ground: "#1c1012", accent: "#8b1e1e", motif: "ruins" },
};

export type LocationMotif =
  | "forest"
  | "marsh"
  | "cave"
  | "desert"
  | "peaks"
  | "ruins"
  | "abyss";
