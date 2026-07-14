"use client";

import { useState } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { Rarity } from "@kingdom/db";
import { ItemCard, type ItemStats } from "@/components/ItemCard";
import { rarityMeta } from "@/lib/rarity";
import {
  buyAction,
  sellAction,
  listItemAction,
  buyListingAction,
  cancelListingAction,
  type MarketActionState,
} from "./actions";

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

export type ListingView = {
  listingId: string;
  name: string;
  rarity: Rarity;
  levelRequirement: number;
  price: number;
  sellerName: string;
  stats: ItemStats;
};

export type MyListingView = {
  listingId: string;
  name: string;
  rarity: Rarity;
  price: number;
  proceeds: number;
};

type Listable = { inventoryItemId: string; name: string; rarity: Rarity };

type Tab = "buy" | "sell" | "players";

function SubmitButton({
  field,
  value,
  label,
  variant = "gold",
}: {
  field?: string;
  value?: string;
  label: string;
  variant?: "gold" | "ghost";
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      name={field}
      value={value}
      disabled={pending}
      className={`${variant === "gold" ? "btn-gold" : "btn-ghost"} px-3 py-1 text-xs disabled:opacity-40`}
    >
      {pending ? "…" : label}
    </button>
  );
}

function Banner({ state }: { state: MarketActionState }) {
  if (state.error) {
    return (
      <p className="rounded-md border border-blood/40 bg-blood/10 px-3 py-2 text-sm text-red-300">
        {state.error}
      </p>
    );
  }
  if (state.notice) {
    return (
      <p className="rounded-md border border-gold/40 bg-gold/10 px-3 py-2 text-sm text-gold-bright">
        {state.notice}
      </p>
    );
  }
  return null;
}

export function ShopView({
  gold,
  shopItems,
  sellItems,
  listings,
  myListings,
  listable,
}: {
  gold: number;
  shopItems: ShopItemView[];
  sellItems: SellItemView[];
  listings: ListingView[];
  myListings: MyListingView[];
  listable: Listable[];
}) {
  const [tab, setTab] = useState<Tab>("buy");
  const [buyState, buy] = useActionState<MarketActionState, FormData>(buyAction, {
    error: null,
    notice: null,
  });
  const [sellState, sell] = useActionState<MarketActionState, FormData>(sellAction, {
    error: null,
    notice: null,
  });
  const [listState, list] = useActionState<MarketActionState, FormData>(listItemAction, {
    error: null,
    notice: null,
  });
  const [buyListingState, buyListing] = useActionState<MarketActionState, FormData>(
    buyListingAction,
    { error: null, notice: null },
  );
  const [cancelState, cancel] = useActionState<MarketActionState, FormData>(
    cancelListingAction,
    { error: null, notice: null },
  );

  const playersState: MarketActionState = {
    error: listState.error ?? buyListingState.error ?? cancelState.error,
    notice: listState.notice ?? buyListingState.notice ?? cancelState.notice,
  };
  const state = tab === "buy" ? buyState : tab === "sell" ? sellState : playersState;

  const tabs: { key: Tab; label: string }[] = [
    { key: "buy", label: "חנות · קנייה" },
    { key: "sell", label: "חנות · מכירה" },
    { key: "players", label: "שוק שחקנים" },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gold">שוק</h1>
        <span className="flex items-center gap-1 text-gold">
          <span aria-hidden>🪙</span>
          <span className="tabular-nums">{gold}</span>
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((option) => (
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

      <Banner state={state} />

      {tab === "buy" && (
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
      )}

      {tab === "sell" &&
        (sellItems.length === 0 ? (
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
                  <SubmitButton field="inventoryItemId" value={item.inventoryItemId} label="מכור" />
                </div>
              </ItemCard>
            ))}
          </form>
        ))}

      {tab === "players" && (
        <div className="space-y-6">
          <section className="panel p-4">
            <h2 className="mb-3 text-lg font-semibold text-gold">הצע פריט למכירה</h2>
            {listable.length === 0 ? (
              <p className="text-sm text-neutral-500">אין לך פריטים פנויים למכירה.</p>
            ) : (
              <form action={list} className="flex flex-wrap items-center gap-2">
                <select name="inventoryItemId" required className="field max-w-xs flex-1">
                  {listable.map((item) => (
                    <option key={item.inventoryItemId} value={item.inventoryItemId}>
                      {item.name}
                    </option>
                  ))}
                </select>
                <input
                  name="price"
                  type="number"
                  min={1}
                  required
                  placeholder="מחיר"
                  className="field w-32"
                />
                <SubmitButton label="הצע למכירה" />
              </form>
            )}
            <p className="mt-2 text-xs text-neutral-500">עמלת שוק: 5% מהמחיר.</p>
          </section>

          {myListings.length > 0 && (
            <section>
              <h2 className="mb-3 text-lg font-semibold text-gold">ההצעות שלי</h2>
              <form action={cancel} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {myListings.map((listing) => {
                  const meta = rarityMeta[listing.rarity];
                  return (
                    <div key={listing.listingId} className={`panel border p-3 ${meta.border}`}>
                      <div className={`font-semibold ${meta.text}`}>{listing.name}</div>
                      <div className="mt-1 text-xs text-neutral-400">
                        מחיר 🪙 {listing.price} · תקבל {listing.proceeds}
                      </div>
                      <div className="mt-2">
                        <SubmitButton
                          field="listingId"
                          value={listing.listingId}
                          label="בטל"
                          variant="ghost"
                        />
                      </div>
                    </div>
                  );
                })}
              </form>
            </section>
          )}

          <section>
            <h2 className="mb-3 text-lg font-semibold text-gold">פריטים למכירה</h2>
            {listings.length === 0 ? (
              <p className="text-sm text-neutral-500">אין כרגע פריטים בשוק השחקנים.</p>
            ) : (
              <form action={buyListing} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {listings.map((listing) => (
                  <ItemCard
                    key={listing.listingId}
                    name={listing.name}
                    rarity={listing.rarity}
                    levelRequirement={listing.levelRequirement}
                    stats={listing.stats}
                    description={`מוכר: ${listing.sellerName}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gold">🪙 {listing.price}</span>
                      <SubmitButton field="listingId" value={listing.listingId} label="קנה" />
                    </div>
                  </ItemCard>
                ))}
              </form>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
