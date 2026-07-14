"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { travelAction, type WorldActionState } from "./actions";

type LocationView = {
  id: string;
  name: string;
  description: string;
  minLevel: number;
  maxLevel: number;
  energyCost: number;
};

function TravelButton({
  locationId,
  energyCost,
  disabled,
}: {
  locationId: string;
  energyCost: number;
  disabled: boolean;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      name="locationId"
      value={locationId}
      disabled={disabled || pending}
      className="btn-ghost w-full text-sm disabled:cursor-not-allowed disabled:opacity-40"
    >
      {pending ? "במסע…" : `מסע · ${energyCost} אנרגיה`}
    </button>
  );
}

export function WorldMap({
  locations,
  currentLocationId,
  energy,
}: {
  locations: LocationView[];
  currentLocationId: string;
  energy: number;
}) {
  const [state, formAction] = useActionState<WorldActionState, FormData>(
    travelAction,
    { error: null },
  );

  return (
    <section>
      {state.error && (
        <p className="mb-3 rounded-md border border-blood/40 bg-blood/10 px-3 py-2 text-sm text-red-300">
          {state.error}
        </p>
      )}
      <form action={formAction} className="grid gap-3 sm:grid-cols-2">
        {locations.map((location) => {
          const here = location.id === currentLocationId;
          const affordable = energy >= location.energyCost;
          return (
            <div
              key={location.id}
              className={`panel flex flex-col gap-2 p-4 ${
                here ? "border-gold/60 shadow-gold" : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gold">{location.name}</h3>
                <span className="text-xs text-neutral-500">
                  רמות {location.minLevel}–{location.maxLevel}
                </span>
              </div>
              <p className="flex-1 text-xs text-neutral-400">{location.description}</p>
              {here ? (
                <span className="rounded-md border border-gold/40 bg-gold/10 px-3 py-2 text-center text-sm text-gold-bright">
                  אתה כאן
                </span>
              ) : (
                <TravelButton
                  locationId={location.id}
                  energyCost={location.energyCost}
                  disabled={!affordable}
                />
              )}
            </div>
          );
        })}
      </form>
    </section>
  );
}
