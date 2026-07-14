"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Avatar } from "@/components/Avatar";
import type { BattleLogData, BattleLogFighter } from "@/lib/battleLog";

const TURN_INTERVAL_MS = 750;

function FighterCard({
  fighter,
  hp,
  side,
}: {
  fighter: BattleLogFighter;
  hp: number;
  side: "A" | "B";
}) {
  const percent = fighter.startHp > 0 ? Math.max(0, Math.round((hp / fighter.startHp) * 100)) : 0;
  return (
    <div className="panel flex flex-1 flex-col items-center gap-2 p-4">
      {fighter.kind === "character" && fighter.avatarKey ? (
        <Avatar avatarKey={fighter.avatarKey} gender={fighter.gender ?? "MALE"} size={72} />
      ) : (
        <div className="flex h-[72px] w-[72px] items-center justify-center rounded-xl border border-void-edge bg-void-soft text-3xl">
          👹
        </div>
      )}
      <div className="text-center">
        <div className="font-semibold text-gold">{fighter.name}</div>
        <div className="text-xs text-neutral-500">רמה {fighter.level}</div>
      </div>
      <div className="w-full">
        <div className="mb-1 flex justify-between text-xs text-neutral-400">
          <span>בריאות</span>
          <span className="tabular-nums">{Math.max(0, hp)}</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-void-soft">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              side === "A" ? "bg-emerald-600" : "bg-blood"
            }`}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export function BattleReplay({ log }: { log: BattleLogData }) {
  const [step, setStep] = useState(0);
  const total = log.turns.length;

  useEffect(() => {
    if (step >= total) {
      return;
    }
    const timer = setTimeout(() => setStep((value) => value + 1), TURN_INTERVAL_MS);
    return () => clearTimeout(timer);
  }, [step, total]);

  const shown = log.turns.slice(0, step);
  const lastShown = shown.at(-1);
  const hpA = lastShown ? lastShown.hpA : log.attacker.startHp;
  const hpB = lastShown ? lastShown.hpB : log.defender.startHp;
  const finished = step >= total;

  const nameFor = (side: "A" | "B") =>
    side === "A" ? log.attacker.name : log.defender.name;
  const targetFor = (side: "A" | "B") =>
    side === "A" ? log.defender.name : log.attacker.name;

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div className="flex items-stretch gap-3">
        <FighterCard fighter={log.attacker} hp={hpA} side="A" />
        <div className="flex items-center text-2xl text-neutral-600">⚔️</div>
        <FighterCard fighter={log.defender} hp={hpB} side="B" />
      </div>

      <div className="panel max-h-64 overflow-y-auto p-4">
        <ul className="space-y-1.5 text-sm">
          {shown.map((turn, index) => (
            <li
              key={index}
              className={turn.actor === "A" ? "text-emerald-300" : "text-red-300"}
            >
              {turn.hit ? (
                <>
                  {nameFor(turn.actor)} פגע ב{targetFor(turn.actor)} · {turn.damage} נזק
                  {turn.crit && <span className="font-bold text-gold-bright"> · מכה קריטית!</span>}
                </>
              ) : (
                <>{nameFor(turn.actor)} החטיא</>
              )}
            </li>
          ))}
          {!finished && <li className="text-neutral-600">…</li>}
        </ul>
      </div>

      {finished && (
        <div
          className={`panel p-5 text-center ${
            log.rewards.won
              ? "border-gold/60 shadow-gold"
              : log.rewards.draw
                ? ""
                : "border-blood/50"
          }`}
        >
          <h2 className="text-xl font-bold">
            {log.rewards.won ? (
              <span className="text-gold">ניצחון!</span>
            ) : log.rewards.draw ? (
              <span className="text-neutral-300">תיקו</span>
            ) : (
              <span className="text-red-400">הפסד</span>
            )}
          </h2>
          <div className="mt-3 flex flex-wrap justify-center gap-x-6 gap-y-1 text-sm text-neutral-300">
            <span>ניסיון: +{log.rewards.xpGained}</span>
            {log.rewards.goldGained > 0 && <span>זהב: +{log.rewards.goldGained}</span>}
            {log.rewards.lootName && (
              <span className="text-gold-bright">שלל: {log.rewards.lootName}</span>
            )}
          </div>
          {log.rewards.leveledUp && (
            <p className="mt-3 text-gold-bright">עלית לרמה {log.rewards.newLevel}!</p>
          )}
          <div className="mt-5 flex justify-center gap-3">
            <Link href="/world" className="btn-gold">
              חזרה לעולם
            </Link>
            <Link href="/battles" className="btn-ghost">
              יומן קרבות
            </Link>
          </div>
        </div>
      )}

      {!finished && (
        <div className="text-center">
          <button
            type="button"
            onClick={() => setStep(total)}
            className="text-sm text-neutral-500 hover:text-gold"
          >
            דלג לסוף
          </button>
        </div>
      )}
    </div>
  );
}
