"use client";

import { useState } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { Rarity } from "@kingdom/db";
import { ItemCard, type ItemStats } from "@/components/ItemCard";
import { buyAction, sellAction, type MarketActionState } from "./actions";

export type ShopItemView = {
  itemId: string;
  name: string;
  description: string;
  rarity: Rarity;
  levelRequirement: number;
  price: number;
  stats: ItemStats;
};

export type SellItemView = {
  inventoryItemId: string;
  name: string;
  rarity: Rarity;
  levelRequirement: number;
  sellPrice: number;
  stats: ItemStats;
};

function SubmitButton({
  field,
  value,
  label,
}: {
  field: string;
  value: string;
  label: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      name={field}
      value={value}
      disabled={pending}
      className="btn-gold px-3 py-1 text-xs disabled:opacity-40"
    >
      {label}
    </button>
  );
}

export function ShopView({
  gold,
  shopItems,
  sellItems,
}: {
  gold: number;
  shopItems: ShopItemView[];
  sellItems: SellItemView[];
}) {
  const [tab, setTab] = useState<"buy" | "sell">("buy");
  const [buyState, buy] = useActionState<MarketActionState, FormData>(buyAction, {
    error: null,
    notice: null,
  });
  const [sellState, sell] = useActionState<MarketActionState, FormData>(sellAction, {
    error: null,
    notice: null,
  });

  const state = tab === "buy" ? buyState : sellState;

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gold">חנות הכפר</h1>
        <span className="flex items-center gap-1 text-gold">
          <span aria-hidden>🪙</span>
          <span className="tabular-nums">{gold}</span>
        </span>
      </div>

      <div className="flex gap-2">
        {(["buy", "sell"] as const).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setTab(value)}
            className={`rounded-md border px-4 py-2 text-sm transition-colors ${
              tab === value
                ? "border-gold/60 bg-gold/15 text-gold-bright"
                : "border-void-edge text-neutral-300 hover:border-gold/40"
            }`}
          >
            {value === "buy" ? "קנייה" : "מכירה"}
          </button>
        ))}
      </div>

      {state.error && (
        <p className="rounded-md border border-blood/40 bg-blood/10 px-3 py-2 text-sm text-red-300">
          {state.error}
        </p>
      )}
      {state.notice && (
        <p className="rounded-md border border-gold/40 bg-gold/10 px-3 py-2 text-sm text-gold-bright">
          {state.notice}
        </p>
      )}

      {tab === "buy" ? (
        <form action={buy} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {shopItems.map((item) => (
            <ItemCard
              key={item.itemId}
              name={item.name}
              rarity={item.rarity}
              levelRequirement={item.levelRequirement}
              stats={item.stats}
              description={item.description}
            >
              <div className="flex items-center gap-2">
                <span className="text-xs text-gold">🪙 {item.price}</span>
                <SubmitButton field="itemId" value={item.itemId} label="קנה" />
              </div>
            </ItemCard>
          ))}
        </form>
      ) : sellItems.length === 0 ? (
        <p className="text-sm text-neutral-500">אין לך פריטים למכירה.</p>
      ) : (
        <form action={sell} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {sellItems.map((item) => (
            <ItemCard
              key={item.inventoryItemId}
              name={item.name}
              rarity={item.rarity}
              levelRequirement={item.levelRequirement}
              stats={item.stats}
            >
              <div className="flex items-center gap-2">
                <span className="text-xs text-gold">🪙 {item.sellPrice}</span>
                <SubmitButton
                  field="inventoryItemId"
                  value={item.inventoryItemId}
                  label="מכור"
                />
              </div>
            </ItemCard>
          ))}
        </form>
      )}
    </div>
  );
}
