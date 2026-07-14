import { Rarity } from "@kingdom/db";

export const rarityMeta: Record<Rarity, { label: string; text: string; border: string }> = {
  COMMON: { label: "רגיל", text: "text-neutral-300", border: "border-neutral-600/50" },
  UNCOMMON: { label: "לא שכיח", text: "text-emerald-400", border: "border-emerald-500/40" },
  RARE: { label: "נדיר", text: "text-blue-400", border: "border-blue-500/40" },
  EPIC: { label: "אפי", text: "text-purple-400", border: "border-purple-500/40" },
  LEGENDARY: { label: "אגדי", text: "text-amber-400", border: "border-amber-500/50" },
};
