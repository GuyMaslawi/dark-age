"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { attackPlayerAction, type WorldActionState } from "./actions";

type OpponentView = {
  id: string;
  name: string;
  level: number;
  subLevel: number;
  pvpWins: number;
  pvpLosses: number;
  protected: boolean;
};

function AttackButton({ defenderId, disabled }: { defenderId: string; disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      name="defenderId"
      value={defenderId}
      disabled={disabled || pending}
      className="btn-gold px-3 py-1 text-xs disabled:cursor-not-allowed disabled:opacity-40"
    >
      {pending ? "בקרב…" : "תקוף"}
    </button>
  );
}

export function OpponentsList({
  opponents,
  energy,
  pvpCost,
}: {
  opponents: OpponentView[];
  energy: number;
  pvpCost: number;
}) {
  const [state, formAction] = useActionState<WorldActionState, FormData>(
    attackPlayerAction,
    { error: null },
  );
  const canFight = energy >= pvpCost;

  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold text-gold">שחקנים באזור</h2>
      {state.error && (
        <p className="mb-3 rounded-md border border-blood/40 bg-blood/10 px-3 py-2 text-sm text-red-300">
          {state.error}
        </p>
      )}
      {opponents.length === 0 ? (
        <p className="text-sm text-neutral-500">
          אין שחקנים בטווח הרמות שלך באזור זה.
        </p>
      ) : (
        <form action={formAction} className="grid gap-3 sm:grid-cols-2">
          {opponents.map((opponent) => (
            <div key={opponent.id} className="panel flex items-center justify-between gap-3 p-3">
              <div className="min-w-0">
                <Link
                  href={`/player/${opponent.id}`}
                  className="truncate font-medium text-gold hover:text-gold-bright"
                >
                  {opponent.name}
                </Link>
                <div className="text-xs text-neutral-500">
                  רמה {opponent.level}.{opponent.subLevel} · נצחונות {opponent.pvpWins}
                </div>
              </div>
              {opponent.protected ? (
                <span className="shrink-0 rounded-full border border-blue-500/40 px-2 py-1 text-[11px] text-blue-300">
                  מוגן
                </span>
              ) : (
                <AttackButton defenderId={opponent.id} disabled={!canFight} />
              )}
            </div>
          ))}
        </form>
      )}
      {!canFight && (
        <p className="mt-3 text-xs text-neutral-500">
          נדרשות {pvpCost} נקודות אנרגיה לתקיפת שחקן.
        </p>
      )}
    </section>
  );
}
