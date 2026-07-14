"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { StatKey } from "@kingdom/game-engine";
import { allocatePointAction, type AllocateState } from "./actions";

type StatRow = {
  key: StatKey;
  label: string;
  hint: string;
  value: number;
};

function PlusButton({ statKey, disabled }: { statKey: StatKey; disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      name="stat"
      value={statKey}
      disabled={disabled || pending}
      className="h-8 w-8 rounded-md border border-void-edge text-lg leading-none text-gold transition-colors hover:border-gold/60 hover:bg-gold/10 disabled:cursor-not-allowed disabled:opacity-30"
      aria-label={`הוסף נקודה ל${statKey}`}
    >
      +
    </button>
  );
}

export function AllocatePanel({
  stats,
  unspentPoints,
}: {
  stats: StatRow[];
  unspentPoints: number;
}) {
  const [state, formAction] = useActionState<AllocateState, FormData>(
    allocatePointAction,
    { error: null },
  );
  const hasPoints = unspentPoints > 0;

  return (
    <div className="panel p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gold">פרמטרים</h2>
        <span
          className={`rounded-full px-3 py-1 text-xs ${
            hasPoints
              ? "border border-gold/50 bg-gold/10 text-gold-bright"
              : "border border-void-edge text-neutral-500"
          }`}
        >
          נקודות פנויות: {unspentPoints}
        </span>
      </div>

      <form action={formAction} className="space-y-3">
        {stats.map((stat) => (
          <div
            key={stat.key}
            className="flex items-center justify-between gap-3 rounded-md bg-void-soft/60 px-3 py-2"
          >
            <div className="min-w-0">
              <div className="font-medium">{stat.label}</div>
              <div className="truncate text-xs text-neutral-500">{stat.hint}</div>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-8 text-center text-lg font-bold tabular-nums text-gold-bright">
                {stat.value}
              </span>
              <PlusButton statKey={stat.key} disabled={!hasPoints} />
            </div>
          </div>
        ))}
      </form>

      {state.error && (
        <p className="mt-3 text-sm text-red-300">{state.error}</p>
      )}
    </div>
  );
}
