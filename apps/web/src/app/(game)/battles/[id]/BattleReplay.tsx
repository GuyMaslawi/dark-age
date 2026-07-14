"use client";

import Link from "next/link";
import { useEffect, useState, type CSSProperties } from "react";
import { Portrait } from "@/components/art/Portrait";
import { MonsterArt } from "@/components/art/MonsterArt";
import { GameArt } from "@/components/GameArt";
import { LocationScene } from "@/components/art/LocationScene";
import { locationArtSrc } from "@/lib/art";
import type { BattleLogData, BattleLogFighter } from "@/lib/battleLog";
import type { BattleTurn } from "@kingdom/game-engine";

const TURN_INTERVAL_MS = 850;

function FighterArt({ fighter, size }: { fighter: BattleLogFighter; size: number }) {
  if (fighter.kind === "character" && fighter.avatarKey) {
    return (
      <Portrait
        avatarKey={fighter.avatarKey}
        gender={fighter.gender ?? "MALE"}
        name={fighter.name}
        size={size}
        rounded="rounded-2xl"
      />
    );
  }
  return (
    <MonsterArt
      slug={fighter.slug ?? fighter.name}
      name={fighter.name}
      size={size}
      rounded="rounded-2xl"
    />
  );
}

function FighterStage({
  fighter,
  hp,
  side,
  activeTurn,
  stepKey,
}: {
  fighter: BattleLogFighter;
  hp: number;
  side: "A" | "B";
  activeTurn: BattleTurn | null;
  stepKey: number;
}) {
  const percent = fighter.startHp > 0 ? Math.max(0, Math.round((hp / fighter.startHp) * 100)) : 0;
  const acting = activeTurn?.actor === side;
  const incoming = activeTurn && activeTurn.actor !== side ? activeTurn : null;
  const hurt = incoming?.hit ?? false;
  const barColor = side === "A" ? "bg-emerald-500" : "bg-blood";

  const wrapAnim = acting ? "animate-strike" : hurt ? "animate-hitshake" : "";
  const wrapStyle: CSSProperties = {
    ["--strike-x" as string]: side === "A" ? "-30px" : "30px",
  };

  return (
    <div className="flex flex-1 flex-col items-center gap-3">
      <div className="relative">
        <div key={stepKey} className={wrapAnim} style={wrapStyle}>
          <FighterArt fighter={fighter} size={132} />
          {hurt && (
            <span
              key={`flash-${stepKey}`}
              className="animate-hitflash pointer-events-none absolute inset-0 rounded-2xl bg-blood"
            />
          )}
        </div>
        {incoming && (
          <span
            key={`dmg-${stepKey}`}
            className={`animate-floatup pointer-events-none absolute left-1/2 top-2 whitespace-nowrap text-2xl font-black drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] ${
              incoming.hit
                ? incoming.crit
                  ? "text-3xl text-gold-bright"
                  : "text-red-300"
                : "text-neutral-400"
            }`}
          >
            {incoming.hit ? `-${incoming.damage}${incoming.crit ? "!" : ""}` : "החטיא"}
          </span>
        )}
      </div>

      <div className="text-center">
        <div className="text-lg font-bold text-gold drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
          {fighter.name}
        </div>
        <div className="text-xs text-neutral-300">רמה {fighter.level}</div>
      </div>

      <div className="w-full max-w-[200px]">
        <div className="mb-1 flex justify-between text-xs text-neutral-200">
          <span>בריאות</span>
          <span className="tabular-nums">{Math.max(0, hp)}</span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full border border-void-edge bg-void/80">
          <div
            className={`h-full rounded-full transition-all duration-500 ${barColor}`}
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
    if (step >= total) return;
    const timer = setTimeout(() => setStep((value) => value + 1), TURN_INTERVAL_MS);
    return () => clearTimeout(timer);
  }, [step, total]);

  const shown = log.turns.slice(0, step);
  const lastShown = shown.at(-1);
  const hpA = lastShown ? lastShown.hpA : log.attacker.startHp;
  const hpB = lastShown ? lastShown.hpB : log.defender.startHp;
  const activeTurn = step > 0 ? log.turns[step - 1] ?? null : null;
  const finished = step >= total;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="relative overflow-hidden rounded-2xl border border-void-edge">
        <GameArt
          src={locationArtSrc("arena")}
          alt="זירה"
          className="absolute inset-0 h-full w-full opacity-60"
          imgClassName="h-full w-full object-cover"
          fallback={<LocationScene slug="arena" className="absolute inset-0 h-full w-full" />}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(139,30,30,0.28),transparent_60%)] bg-void/55" />
        <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_120px_30px_rgba(0,0,0,0.75)]" />

        <div className="relative flex items-center gap-2 px-4 py-10 sm:px-8">
          <FighterStage
            fighter={log.attacker}
            hp={hpA}
            side="A"
            activeTurn={activeTurn}
            stepKey={step}
          />
          <div className="flex flex-col items-center gap-1 px-1">
            <span className="text-3xl text-neutral-500 drop-shadow">⚔️</span>
            <span className="rounded-full bg-void/80 px-2 py-0.5 text-[11px] tabular-nums text-neutral-300">
              {Math.min(step, total)}/{total}
            </span>
          </div>
          <FighterStage
            fighter={log.defender}
            hp={hpB}
            side="B"
            activeTurn={activeTurn}
            stepKey={step}
          />
        </div>

        {!finished && (
          <button
            type="button"
            onClick={() => setStep(total)}
            className="absolute bottom-3 left-1/2 z-10 -translate-x-1/2 rounded-md bg-void/70 px-3 py-1 text-xs text-neutral-300 transition-colors hover:text-gold"
          >
            דלג לסוף
          </button>
        )}
      </div>

      {finished && (
        <div
          className={`panel mt-5 p-5 text-center ${
            log.rewards.won
              ? "border-gold/60 shadow-gold"
              : log.rewards.draw
                ? ""
                : "border-blood/50"
          }`}
        >
          <h2 className="text-2xl font-bold">
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
    </div>
  );
}
