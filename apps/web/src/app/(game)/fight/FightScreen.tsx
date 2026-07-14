"use client";

import Link from "next/link";
import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import type { BodyRegion } from "@kingdom/game-engine";
import { Avatar } from "@/components/Avatar";
import { MonsterSigil } from "@/components/art/MonsterSigil";
import { GameArt } from "@/components/GameArt";
import { LocationScene } from "@/components/art/LocationScene";
import { locationArtSrc, portraitArtSrc, monsterArtSrc } from "@/lib/art";
import {
  REGION_LABELS,
  strikeLine,
  type FightView,
  type FighterMeta,
} from "@/lib/fight";
import { roundAction, abandonAction, type RoundActionState } from "./actions";

const REGIONS: BodyRegion[] = ["HEAD", "TORSO", "LEGS"];

const REGION_BOX: Record<BodyRegion, { top: string; height: string }> = {
  HEAD: { top: "1%", height: "27%" },
  TORSO: { top: "29%", height: "39%" },
  LEGS: { top: "69%", height: "30%" },
};

const ATTACK_TONE = "#e0483a";
const GUARD_TONE = "#3b82f6";

type FloatDmg = { key: number; region: BodyRegion; text: string; crit: boolean };

function FighterFill({ meta }: { meta: FighterMeta }) {
  if (meta.kind === "character" && meta.avatarKey) {
    return (
      <GameArt
        src={portraitArtSrc(meta.avatarKey, meta.gender ?? "MALE")}
        alt={meta.name}
        className="absolute inset-0 h-full w-full"
        imgClassName="h-full w-full object-cover object-top"
        fallback={
          <div className="flex h-full w-full items-center justify-center">
            <Avatar avatarKey={meta.avatarKey} gender={meta.gender ?? "MALE"} size={220} />
          </div>
        }
      />
    );
  }
  return (
    <GameArt
      src={monsterArtSrc(meta.slug ?? meta.name)}
      alt={meta.name}
      className="absolute inset-0 h-full w-full"
      imgClassName="h-full w-full object-cover object-top"
      fallback={
        <div className="flex h-full w-full items-center justify-center">
          <MonsterSigil slug={meta.slug ?? meta.name} name={meta.name} size={220} />
        </div>
      }
    />
  );
}

function HpBar({ hp, max, side }: { hp: number; max: number; side: "A" | "B" }) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (hp / max) * 100)) : 0;
  return (
    <div className="w-full">
      <div className="h-2.5 overflow-hidden rounded-full border border-void-edge bg-void/80">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            side === "A" ? "bg-emerald-500" : "bg-blood"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function BodyStage({
  meta,
  hp,
  max,
  side,
  role,
  selected,
  onSelect,
  disabled,
  shake,
  float,
}: {
  meta: FighterMeta;
  hp: number;
  max: number;
  side: "A" | "B";
  role: "attack" | "guard";
  selected: BodyRegion;
  onSelect: (region: BodyRegion) => void;
  disabled: boolean;
  shake: boolean;
  float: FloatDmg | null;
}) {
  const tone = role === "attack" ? ATTACK_TONE : GUARD_TONE;
  const icon = role === "attack" ? "🗡️" : "🛡️";
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-2">
      <div className="flex items-center gap-2">
        <span className="truncate text-sm font-bold text-gold drop-shadow-[0_1px_5px_rgba(0,0,0,0.9)]">
          {meta.name}
        </span>
        <span className="shrink-0 text-[11px] text-neutral-300">רמה {meta.level}</span>
        <span className="ms-auto shrink-0 tabular-nums text-[11px] text-neutral-200">
          {Math.max(0, Math.round(hp))}/{max}
        </span>
      </div>
      <HpBar hp={hp} max={max} side={side} />

      <div
        className={`relative w-full overflow-hidden rounded-2xl border border-void-edge bg-void/40 ${
          shake ? "animate-hitshake" : ""
        }`}
        style={{ aspectRatio: "3 / 4" }}
      >
        <FighterFill meta={meta} />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-void/70 via-transparent to-void/20" />

        {REGIONS.map((region) => {
          const box = REGION_BOX[region];
          const active = selected === region;
          return (
            <button
              key={region}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(region)}
              aria-label={`${role === "attack" ? "תקוף" : "הגן"} — ${REGION_LABELS[region]}`}
              aria-pressed={active}
              className="group absolute inset-x-0 outline-none transition-all disabled:cursor-default"
              style={{ top: box.top, height: box.height }}
            >
              <span
                className="absolute inset-1 rounded-xl border transition-all duration-200"
                style={{
                  borderColor: active ? tone : "rgba(255,255,255,0.12)",
                  background: active
                    ? `color-mix(in srgb, ${tone} 24%, transparent)`
                    : "transparent",
                  boxShadow: active ? `inset 0 0 34px -8px ${tone}, 0 0 20px -10px ${tone}` : "none",
                }}
              />
              {!disabled && (
                <span
                  className="absolute inset-1 rounded-xl opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                  style={{ background: `color-mix(in srgb, ${tone} 14%, transparent)` }}
                />
              )}
              <span
                className={`absolute start-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full px-2 py-0.5 text-[11px] font-semibold transition-all ${
                  active ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                }`}
                style={{
                  background: "rgba(8,8,10,0.78)",
                  color: "#fff",
                  border: `1px solid ${active ? tone : "rgba(255,255,255,0.2)"}`,
                }}
              >
                {active ? `${icon} ` : ""}
                {REGION_LABELS[region]}
              </span>
            </button>
          );
        })}

        {float && (
          <span
            key={float.key}
            className="animate-dmgfloat pointer-events-none absolute start-1/2 z-10 text-2xl font-black"
            style={{
              top: REGION_BOX[float.region].top,
              color: float.crit ? "#e4c04a" : "#ff6b5e",
              textShadow: "0 2px 8px rgba(0,0,0,0.95)",
            }}
          >
            {float.text}
          </span>
        )}
      </div>
    </div>
  );
}

function AttackButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={disabled || pending}
      className="btn-gold px-10 py-3 text-lg shadow-gold disabled:opacity-40"
    >
      {pending ? "מתקיף…" : "⚔️ תקוף"}
    </button>
  );
}

export function FightScreen({ initial }: { initial: FightView }) {
  const [state, formAction] = useActionState<RoundActionState, FormData>(roundAction, {
    error: null,
    view: null,
  });
  const view = state.view ?? initial;

  const [strike, setStrike] = useState<BodyRegion>("TORSO");
  const [guard, setGuard] = useState<BodyRegion>("TORSO");
  const [logOpen, setLogOpen] = useState(false);
  const logEndRef = useRef<HTMLDivElement>(null);

  const lastRound = view.log.at(-1);
  const roundKey = view.log.length;

  const aHit = lastRound?.strikes.find((s) => s.actor === "B" && s.outcome !== "MISS");
  const bHit = lastRound?.strikes.find((s) => s.actor === "A" && s.outcome !== "MISS");

  const aFloat: FloatDmg | null = aHit
    ? { key: roundKey, region: aHit.region, text: `-${aHit.damage}`, crit: aHit.outcome === "CRIT" }
    : null;
  const bFloat: FloatDmg | null = bHit
    ? { key: roundKey, region: bHit.region, text: `-${bHit.damage}`, crit: bHit.outcome === "CRIT" }
    : null;

  const lines = useMemo(() => {
    const out: { key: string; text: string; outcome: string }[] = [];
    for (const round of view.log) {
      round.strikes.forEach((s, i) => {
        const attacker = s.actor === "A" ? view.aMeta.name : view.bMeta.name;
        const defender = s.actor === "A" ? view.bMeta.name : view.aMeta.name;
        out.push({
          key: `${round.round}-${i}`,
          text: strikeLine(attacker, defender, s, round.round * 3 + i),
          outcome: s.outcome,
        });
      });
    }
    return out;
  }, [view]);

  useEffect(() => {
    if (logOpen) logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lines.length, logOpen]);

  const outcomeColor: Record<string, string> = {
    HIT: "text-red-300",
    CRIT: "text-gold-bright font-bold",
    BLOCKED: "text-sky-300",
    MISS: "text-neutral-500",
  };

  return (
    <div className="mx-auto max-w-4xl">
      <div className="relative overflow-hidden rounded-2xl border border-void-edge">
        <GameArt
          src={locationArtSrc("arena")}
          alt="זירה"
          className="absolute inset-0 h-full w-full opacity-50"
          imgClassName="h-full w-full object-cover"
          fallback={<LocationScene slug="arena" className="absolute inset-0 h-full w-full" />}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(139,30,30,0.28),transparent_60%)] bg-void/45" />
        <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_120px_30px_rgba(0,0,0,0.75)]" />

        <div className="relative px-3 py-4 sm:px-6 sm:py-6">
          <div className="mb-3 flex items-center justify-center gap-2">
            <span className="rounded-full bg-void/80 px-3 py-0.5 text-xs tabular-nums text-neutral-200">
              סיבוב {view.over ? view.round - 1 : view.round}
            </span>
          </div>
          <div className="flex items-stretch gap-3 sm:gap-5">
            <BodyStage
              meta={view.aMeta}
              hp={view.hpA}
              max={view.barMaxA}
              side="A"
              role="guard"
              selected={guard}
              onSelect={setGuard}
              disabled={view.over}
              shake={!!aHit}
              float={aFloat}
            />
            <BodyStage
              meta={view.bMeta}
              hp={view.hpB}
              max={view.barMaxB}
              side="B"
              role="attack"
              selected={strike}
              onSelect={setStrike}
              disabled={view.over}
              shake={!!bHit}
              float={bFloat}
            />
          </div>
        </div>
      </div>

      {!view.over ? (
        <form action={formAction} className="mt-4 flex flex-col items-center gap-3">
          <input type="hidden" name="strike" value={strike} />
          <input type="hidden" name="guard" value={guard} />
          <p className="text-center text-xs text-neutral-400">
            <span style={{ color: ATTACK_TONE }}>🗡️ לחץ על גוף היריב</span> כדי לבחור לאן לתקוף ·{" "}
            <span style={{ color: GUARD_TONE }}>🛡️ לחץ על גופך</span> כדי לבחור על מה להגן
          </p>
          {state.error && <p className="text-center text-sm text-red-300">{state.error}</p>}
          <div className="flex items-center justify-center gap-3">
            <AttackButton disabled={false} />
            <button
              type="button"
              onClick={() => abandonAction()}
              className="btn-ghost px-4 py-2 text-sm"
            >
              ברח
            </button>
          </div>
        </form>
      ) : (
        <div
          className={`panel mt-4 p-5 text-center ${
            view.rewards?.won ? "border-gold/60 shadow-gold" : view.rewards?.draw ? "" : "border-blood/50"
          }`}
        >
          <h2 className="text-2xl font-bold">
            {view.rewards?.won ? (
              <span className="text-gold">ניצחון!</span>
            ) : view.rewards?.draw ? (
              <span className="text-neutral-300">תיקו</span>
            ) : (
              <span className="text-red-400">הפסד</span>
            )}
          </h2>
          {view.rewards && (
            <div className="mt-3 space-y-1 text-sm text-neutral-300">
              {view.rewards.won ? (
                <p>
                  ניסיון: <span className="text-gold-bright">+{view.rewards.xpGained}</span>
                </p>
              ) : (
                <p className="text-neutral-400">
                  לו ניצחת היית מקבל{" "}
                  <span className="text-gold-bright">+{view.rewards.xpPotential}</span> ניסיון
                </p>
              )}
              {view.rewards.goldGained > 0 && <p>זהב: +{view.rewards.goldGained}</p>}
              {view.rewards.lootName && (
                <p className="text-gold-bright">שלל: {view.rewards.lootName}</p>
              )}
              {view.rewards.leveledUp && (
                <p className="text-gold-bright">עלית לרמה {view.rewards.newLevel}!</p>
              )}
            </div>
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

      <div className="panel mt-4 overflow-hidden">
        <button
          type="button"
          onClick={() => setLogOpen((v) => !v)}
          className="flex w-full items-center justify-between px-4 py-2 text-right"
        >
          <span className="text-sm font-semibold text-gold">יומן הקרב</span>
          <span className="text-xs text-neutral-400">{logOpen ? "▼ הסתר" : "▲ הצג"}</span>
        </button>
        {logOpen && (
          <div className="h-40 space-y-1 overflow-y-auto border-t border-void-edge px-4 py-3 pe-1 text-sm">
            {lines.length === 0 ? (
              <p className="text-neutral-500">בחר איזור לתקיפה והגנה, ואז לחץ תקוף.</p>
            ) : (
              lines.map((line) => (
                <p key={line.key} className={outcomeColor[line.outcome] ?? "text-neutral-300"}>
                  {line.text}
                </p>
              ))
            )}
            <div ref={logEndRef} />
          </div>
        )}
      </div>
    </div>
  );
}
