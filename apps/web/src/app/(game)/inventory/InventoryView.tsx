"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { EquipmentSlot, ItemType, Rarity } from "@kingdom/db";
import type { EffectiveStats } from "@kingdom/game-engine";
import { ItemCard, type ItemStats } from "@/components/ItemCard";
import { EQUIP_SLOTS } from "@/lib/equipment";
import { rarityMeta } from "@/lib/rarity";
import {
  equipAction,
  unequipAction,
  type InventoryActionState,
} from "./actions";

export type InventoryItemView = {
  inventoryItemId: string;
  equippedSlot: EquipmentSlot | null;
  name: string;
  description: string;
  rarity: Rarity;
  type: ItemType;
  levelRequirement: number;
  equippable: boolean;
  meetsLevel: boolean;
  stats: ItemStats;
};

function ActionButton({
  field,
  value,
  label,
  disabled,
  variant,
}: {
  field: string;
  value: string;
  label: string;
  disabled?: boolean;
  variant: "gold" | "ghost";
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      name={field}
      value={value}
      disabled={disabled || pending}
      className={`${variant === "gold" ? "btn-gold" : "btn-ghost"} px-3 py-1 text-xs disabled:cursor-not-allowed disabled:opacity-40`}
    >
      {label}
    </button>
  );
}

function StatCompare({
  label,
  base,
  effective,
}: {
  label: string;
  base: number;
  effective: number;
}) {
  const delta = effective - base;
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-neutral-400">{label}</span>
      <span className="tabular-nums">
        <span className="text-gold-bright">{effective}</span>
        {delta > 0 && <span className="ms-1 text-xs text-emerald-400">(+{delta})</span>}
      </span>
    </div>
  );
}

export function InventoryView({
  equippedBySlot,
  backpack,
  base,
  effective,
}: {
  equippedBySlot: Partial<Record<EquipmentSlot, InventoryItemView>>;
  backpack: InventoryItemView[];
  base: { strength: number; wisdom: number; agility: number; endurance: number };
  effective: EffectiveStats;
}) {
  const [equipState, equip] = useActionState<InventoryActionState, FormData>(
    equipAction,
    { error: null },
  );
  const [unequipState, unequip] = useActionState<InventoryActionState, FormData>(
    unequipAction,
    { error: null },
  );
  const error = equipState.error ?? unequipState.error;

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <h1 className="text-2xl font-bold text-gold">מלאי וציוד</h1>
      {error && (
        <p className="rounded-md border border-blood/40 bg-blood/10 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      )}

      <div className="grid gap-5 md:grid-cols-3">
        <form action={unequip} className="md:col-span-2">
          <h2 className="mb-3 text-lg font-semibold text-gold">ציוד לבוש</h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {EQUIP_SLOTS.map(({ slot, label }) => {
              const item = equippedBySlot[slot];
              const meta = item ? rarityMeta[item.rarity] : null;
              return (
                <div
                  key={slot}
                  className={`rounded-lg border p-3 ${
                    meta ? meta.border : "border-void-edge border-dashed"
                  }`}
                >
                  <div className="mb-1 text-[11px] text-neutral-500">{label}</div>
                  {item ? (
                    <div className="space-y-2">
                      <div className={`text-sm font-medium ${meta?.text}`}>
                        {item.name}
                      </div>
                      <ActionButton
                        field="inventoryItemId"
                        value={item.inventoryItemId}
                        label="הסר"
                        variant="ghost"
                      />
                    </div>
                  ) : (
                    <div className="text-sm text-neutral-600">ריק</div>
                  )}
                </div>
              );
            })}
          </div>
        </form>

        <div className="panel h-fit p-4">
          <h2 className="mb-3 text-lg font-semibold text-gold">מאפיינים אפקטיביים</h2>
          <div className="space-y-1.5">
            <StatCompare label="כוח" base={base.strength} effective={effective.strength} />
            <StatCompare label="בינה" base={base.wisdom} effective={effective.wisdom} />
            <StatCompare label="זריזות" base={base.agility} effective={effective.agility} />
            <StatCompare label="סיבולת" base={base.endurance} effective={effective.endurance} />
            <div className="mt-2 border-t border-void-edge pt-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-400">נזק נשק</span>
                <span className="tabular-nums text-gold-bright">{effective.weaponBase}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-400">שריון</span>
                <span className="tabular-nums text-gold-bright">{effective.armorValue}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-gold">תרמיל</h2>
        {backpack.length === 0 ? (
          <p className="text-sm text-neutral-500">התרמיל ריק.</p>
        ) : (
          <form action={equip} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {backpack.map((item) => (
              <ItemCard
                key={item.inventoryItemId}
                name={item.name}
                rarity={item.rarity}
                levelRequirement={item.levelRequirement}
                stats={item.stats}
                description={item.description}
                meetsLevel={item.meetsLevel}
              >
                {item.equippable && (
                  <ActionButton
                    field="inventoryItemId"
                    value={item.inventoryItemId}
                    label="לבש"
                    variant="gold"
                    disabled={!item.meetsLevel}
                  />
                )}
              </ItemCard>
            ))}
          </form>
        )}
      </div>
    </div>
  );
}
