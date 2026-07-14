"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Scene } from "@/components/scene/Scene";
import { HotspotAt, HotspotFrame } from "@/components/scene/Hotspot";
import { MonsterArt } from "@/components/art/MonsterArt";
import { LocationScene } from "@/components/art/LocationScene";
import { locationArtSrc } from "@/lib/art";
import {
  attackMonsterAction,
  travelAction,
  attackPlayerAction,
  type WorldActionState,
} from "./actions";

type LocationView = {
  id: string;
  slug: string;
  name: string;
  minLevel: number;
  maxLevel: number;
  energyCost: number;
};

type MonsterView = {
  id: string;
  slug: string;
  name: string;
  level: number;
  maxHp: number;
  xpReward: number;
  goldMin: number;
  goldMax: number;
};

type OpponentView = {
  id: string;
  name: string;
  level: number;
  subLevel: number;
  pvpWins: number;
  pvpLosses: number;
  protected: boolean;
};

const MONSTER_SPOTS = [
  { x: 30, y: 52 },
  { x: 68, y: 50 },
  { x: 49, y: 63 },
  { x: 22, y: 66 },
  { x: 78, y: 66 },
  { x: 50, y: 44 },
];

function difficulty(monsterLevel: number, characterLevel: number) {
  const diff = monsterLevel - characterLevel;
  if (diff <= -3) return { text: "קל", tone: "#4caf50" };
  if (diff <= 2) return { text: "מאוזן", tone: "#c9a227" };
  if (diff <= 5) return { text: "מסוכן", tone: "#e0873b" };
  return { text: "קטלני", tone: "#c0392b" };
}

function SubmitHotspot({
  field,
  value,
  disabled,
  children,
}: {
  field: string;
  value: string;
  disabled: boolean;
  children: React.ReactNode;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      name={field}
      value={value}
      disabled={disabled || pending}
      className="group block cursor-pointer bg-transparent outline-none disabled:cursor-not-allowed"
    >
      {children}
    </button>
  );
}

export function WorldScene({
  currentLocation,
  locations,
  monsters,
  opponents,
  energy,
  battleCost,
  pvpCost,
  characterLevel,
}: {
  currentLocation: { slug: string; name: string };
  locations: LocationView[];
  monsters: MonsterView[];
  opponents: OpponentView[];
  energy: number;
  battleCost: number;
  pvpCost: number;
  characterLevel: number;
}) {
  const [attackState, attack] = useActionState<WorldActionState, FormData>(
    attackMonsterAction,
    { error: null },
  );
  const [travelState, travel] = useActionState<WorldActionState, FormData>(
    travelAction,
    { error: null },
  );
  const [pvpState, pvp] = useActionState<WorldActionState, FormData>(
    attackPlayerAction,
    { error: null },
  );
  const [panel, setPanel] = useState<null | "travel" | "pvp">(null);

  const canFight = energy >= battleCost;
  const error = attackState.error ?? travelState.error ?? pvpState.error;

  return (
    <Scene
      slug={currentLocation.slug}
      src={locationArtSrc(currentLocation.slug)}
      title={currentLocation.name}
      subtitle={monsters.length > 0 ? "בחר יצור לתקוף" : "אין יצורים באזור זה"}
    >
      {error && (
        <div className="absolute inset-x-0 top-20 z-20 mx-auto w-fit rounded-md border border-blood/50 bg-void/90 px-4 py-2 text-sm text-red-300">
          {error}
        </div>
      )}

      <form action={attack}>
        {monsters.map((monster, index) => {
          const spot = MONSTER_SPOTS[index % MONSTER_SPOTS.length] ?? { x: 50, y: 55 };
          const diff = difficulty(monster.level, characterLevel);
          return (
            <HotspotAt key={monster.id} x={spot.x} y={spot.y}>
              <SubmitHotspot field="monsterId" value={monster.id} disabled={!canFight}>
                <HotspotFrame
                  label={monster.name}
                  sublabel={`${diff.text} · רמה ${monster.level}`}
                  tone={diff.tone}
                  size={92}
                  disabled={!canFight}
                  art={
                    <MonsterArt slug={monster.slug} name={monster.name} size={92} rounded="rounded-2xl" />
                  }
                />
              </SubmitHotspot>
            </HotspotAt>
          );
        })}
      </form>

      <div className="absolute inset-x-0 bottom-0 z-20 flex justify-center gap-8 p-5">
        <button
          type="button"
          onClick={() => setPanel("travel")}
          className="group block cursor-pointer bg-transparent outline-none"
        >
          <HotspotFrame label="מסע" sublabel="אזורים אחרים" icon="🧭" tone="#6fae7e" size={72} />
        </button>
        <button
          type="button"
          onClick={() => setPanel("pvp")}
          className="group block cursor-pointer bg-transparent outline-none"
        >
          <HotspotFrame
            label="שחקנים"
            sublabel={opponents.length > 0 ? `${opponents.length} בטווח` : "אין בטווח"}
            icon="⚔️"
            tone="#c0392b"
            size={72}
          />
        </button>
      </div>

      {panel === "travel" && (
        <Overlay title="מסע אל" onClose={() => setPanel(null)}>
          <form action={travel} className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {locations.map((loc) => {
              const here = loc.slug === currentLocation.slug;
              const affordable = energy >= loc.energyCost;
              return (
                <button
                  key={loc.id}
                  type="submit"
                  name="locationId"
                  value={loc.id}
                  disabled={here || !affordable}
                  className={`group relative overflow-hidden rounded-xl border text-right transition-all disabled:cursor-not-allowed ${
                    here ? "border-gold" : "border-void-edge hover:border-gold/60 hover:-translate-y-0.5"
                  } ${!affordable && !here ? "opacity-45" : ""}`}
                >
                  <LocationScene slug={loc.slug} className="h-24 w-full" />
                  <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-void via-void/40 to-transparent" />
                  <span className="absolute inset-x-0 bottom-0 flex flex-col gap-0.5 p-2">
                    <span className="text-sm font-semibold text-gold-bright">{loc.name}</span>
                    <span className="text-[11px] text-neutral-300">
                      {here ? "אתה כאן" : `רמות ${loc.minLevel}–${loc.maxLevel} · ${loc.energyCost} אנרגיה`}
                    </span>
                  </span>
                </button>
              );
            })}
          </form>
        </Overlay>
      )}

      {panel === "pvp" && (
        <Overlay title="יריבים באזור" onClose={() => setPanel(null)}>
          {opponents.length === 0 ? (
            <p className="text-sm text-neutral-400">אין שחקנים בטווח הרמות שלך כאן.</p>
          ) : (
            <form action={pvp} className="space-y-2">
              {opponents.map((opp) => (
                <div
                  key={opp.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-void-edge bg-void-soft/60 px-3 py-2"
                >
                  <div>
                    <div className="text-sm font-semibold text-gold-bright">{opp.name}</div>
                    <div className="text-[11px] text-neutral-400">
                      רמה {opp.level}.{opp.subLevel} · {opp.pvpWins}‏/{opp.pvpLosses}
                    </div>
                  </div>
                  <button
                    type="submit"
                    name="defenderId"
                    value={opp.id}
                    disabled={opp.protected || energy < pvpCost}
                    className="btn-gold px-3 py-1 text-xs disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {opp.protected ? "מוגן" : "תקוף"}
                  </button>
                </div>
              ))}
            </form>
          )}
        </Overlay>
      )}
    </Scene>
  );
}

function Overlay({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-void/70 p-4 backdrop-blur-sm">
      <div className="panel w-full max-w-lg p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gold">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-neutral-400 transition-colors hover:text-gold"
            aria-label="סגור"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
