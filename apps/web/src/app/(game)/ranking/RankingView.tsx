"use client";

import Link from "next/link";
import { useState } from "react";
import { SceneBackdrop } from "@/components/scene/SceneBackdrop";

export type RankRow = {
  id: string;
  name: string;
  level: number;
  subLevel: number;
  xp: number;
  pvpWins: number;
  pvpLosses: number;
};

function rankColor(index: number): string {
  if (index === 0) return "text-amber-400";
  if (index === 1) return "text-neutral-300";
  if (index === 2) return "text-orange-400";
  return "text-neutral-500";
}

export function RankingView({
  byLevel,
  byPvp,
  currentId,
}: {
  byLevel: RankRow[];
  byPvp: RankRow[];
  currentId: string | null;
}) {
  const [tab, setTab] = useState<"level" | "pvp">("level");
  const rows = tab === "level" ? byLevel : byPvp;

  return (
    <SceneBackdrop slug="throne" icon="👑" title="היכל הדירוג" maxWidth="max-w-2xl">
      <div className="space-y-5">
      <div className="flex gap-2">
        {(
          [
            { key: "level", label: "לפי רמה" },
            { key: "pvp", label: "לפי נצחונות PvP" },
          ] as const
        ).map((option) => (
          <button
            key={option.key}
            type="button"
            onClick={() => setTab(option.key)}
            className={`rounded-md border px-4 py-2 text-sm transition-colors ${
              tab === option.key
                ? "border-gold/60 bg-gold/15 text-gold-bright"
                : "border-void-edge text-neutral-300 hover:border-gold/40"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="panel divide-y divide-void-edge/60">
        {rows.map((row, index) => (
          <div
            key={row.id}
            className={`flex items-center gap-3 px-4 py-2.5 ${
              row.id === currentId ? "bg-gold/10" : ""
            }`}
          >
            <span className={`w-6 text-center font-bold tabular-nums ${rankColor(index)}`}>
              {index + 1}
            </span>
            <Link
              href={`/player/${row.id}`}
              className="flex-1 truncate font-medium text-gold hover:text-gold-bright"
            >
              {row.name}
            </Link>
            <span className="text-xs text-neutral-400">
              רמה {row.level}.{row.subLevel}
            </span>
            <span className="w-16 text-left text-xs text-neutral-500">
              {tab === "pvp" ? `${row.pvpWins} נצ׳` : `${row.xp} XP`}
            </span>
          </div>
        ))}
      </div>
      </div>
    </SceneBackdrop>
  );
}
