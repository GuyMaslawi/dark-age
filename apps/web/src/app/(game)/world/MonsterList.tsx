"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { attackMonsterAction, type WorldActionState } from "./actions";

type MonsterView = {
  id: string;
  name: string;
  level: number;
  maxHp: number;
  xpReward: number;
  goldMin: number;
  goldMax: number;
};

function difficultyLabel(monsterLevel: number, characterLevel: number) {
  const diff = monsterLevel - characterLevel;
  if (diff <= -3) return { text: "קל", className: "text-emerald-400" };
  if (diff <= 2) return { text: "מאוזן", className: "text-gold" };
  if (diff <= 5) return { text: "מסוכן", className: "text-orange-400" };
  return { text: "קטלני", className: "text-red-400" };
}

function AttackButton({ monsterId, disabled }: { monsterId: string; disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      name="monsterId"
      value={monsterId}
      disabled={disabled || pending}
      className="btn-gold text-sm disabled:cursor-not-allowed disabled:opacity-40"
    >
      {pending ? "בקרב…" : "תקוף"}
    </button>
  );
}

export function MonsterList({
  locationName,
  monsters,
  energy,
  battleCost,
  characterLevel,
}: {
  locationName: string;
  monsters: MonsterView[];
  energy: number;
  battleCost: number;
  characterLevel: number;
}) {
  const [state, formAction] = useActionState<WorldActionState, FormData>(
    attackMonsterAction,
    { error: null },
  );
  const canFight = energy >= battleCost;

  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold text-gold">
        יצורים ב{locationName}
      </h2>
      {state.error && (
        <p className="mb-3 rounded-md border border-blood/40 bg-blood/10 px-3 py-2 text-sm text-red-300">
          {state.error}
        </p>
      )}
      {monsters.length === 0 ? (
        <p className="text-sm text-neutral-500">אין יצורים באזור זה.</p>
      ) : (
        <form action={formAction} className="grid gap-3 sm:grid-cols-2">
          {monsters.map((monster) => {
            const difficulty = difficultyLabel(monster.level, characterLevel);
            return (
              <div key={monster.id} className="panel flex flex-col gap-2 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{monster.name}</h3>
                  <span className={`text-xs ${difficulty.className}`}>
                    {difficulty.text} · רמה {monster.level}
                  </span>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-400">
                  <span>בריאות {monster.maxHp}</span>
                  <span className="text-gold">ניסיון {monster.xpReward}</span>
                  <span className="text-gold">
                    זהב {monster.goldMin}–{monster.goldMax}
                  </span>
                </div>
                <AttackButton monsterId={monster.id} disabled={!canFight} />
              </div>
            );
          })}
        </form>
      )}
      {!canFight && (
        <p className="mt-3 text-xs text-neutral-500">
          נדרשות {battleCost} נקודות אנרגיה לכל קרב.
        </p>
      )}
    </section>
  );
}
