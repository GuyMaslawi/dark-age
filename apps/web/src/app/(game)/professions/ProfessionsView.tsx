"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { SceneBackdrop } from "@/components/scene/SceneBackdrop";
import { startProfessionAction, type ProfessionActionState } from "./actions";

export type ProfessionOption = {
  key: string;
  label: string;
  description: string;
  durationMinutes: number;
  energyCost: number;
  reward: number;
};

export type ActiveJobView = {
  type: string;
  label: string;
  finishesAt: string;
  goldReward: number;
};

export type JobHistoryView = {
  id: string;
  label: string;
  goldReward: number;
};

function formatRemaining(ms: number): string {
  if (ms <= 0) return "מוכן לאיסוף";
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function StartButton({ type, disabled }: { type: string; disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      name="type"
      value={type}
      disabled={disabled || pending}
      className="btn-gold px-3 py-1 text-xs disabled:cursor-not-allowed disabled:opacity-40"
    >
      {pending ? "מתחיל…" : "התחל"}
    </button>
  );
}

function Countdown({ finishesAt }: { finishesAt: string }) {
  const target = new Date(finishesAt).getTime();
  const [remaining, setRemaining] = useState(() => target - Date.now());

  useEffect(() => {
    const timer = setInterval(() => setRemaining(target - Date.now()), 1000);
    return () => clearInterval(timer);
  }, [target]);

  return (
    <span className="font-mono tabular-nums text-gold-bright">
      {formatRemaining(remaining)}
    </span>
  );
}

export function ProfessionsView({
  options,
  activeJob,
  history,
  energy,
}: {
  options: ProfessionOption[];
  activeJob: ActiveJobView | null;
  history: JobHistoryView[];
  energy: number;
}) {
  const [state, formAction] = useActionState<ProfessionActionState, FormData>(
    startProfessionAction,
    { error: null },
  );

  return (
    <SceneBackdrop
      slug="forge"
      icon="⚒️"
      title="הנפחייה"
      subtitle="התחל פעולה מתוזמנת אחת בכל פעם. היא תסתיים גם כשאתה לא מחובר."
      maxWidth="max-w-3xl"
    >
      <div className="space-y-5">
      {activeJob && (
        <div className="panel flex items-center justify-between p-4">
          <div>
            <div className="font-semibold text-gold">{activeJob.label} בתהליך</div>
            <div className="text-xs text-neutral-500">
              תגמול צפוי: {activeJob.goldReward} זהב
            </div>
          </div>
          <Countdown finishesAt={activeJob.finishesAt} />
        </div>
      )}

      {state.error && (
        <p className="rounded-md border border-blood/40 bg-blood/10 px-3 py-2 text-sm text-red-300">
          {state.error}
        </p>
      )}

      <form action={formAction} className="grid gap-3 sm:grid-cols-3">
        {options.map((option) => (
          <div key={option.key} className="panel flex flex-col gap-2 p-4">
            <h3 className="font-semibold text-gold">{option.label}</h3>
            <p className="flex-1 text-xs text-neutral-400">{option.description}</p>
            <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-neutral-500">
              <span>{option.durationMinutes} דק׳</span>
              <span>אנרגיה {option.energyCost}</span>
              <span className="text-gold">זהב ~{option.reward}</span>
            </div>
            <StartButton
              type={option.key}
              disabled={activeJob !== null || energy < option.energyCost}
            />
          </div>
        ))}
      </form>

      {history.length > 0 && (
        <div>
          <h2 className="mb-2 text-lg font-semibold text-gold">היסטוריה</h2>
          <ul className="panel divide-y divide-void-edge/60">
            {history.map((job) => (
              <li key={job.id} className="flex items-center justify-between px-4 py-2 text-sm">
                <span>{job.label}</span>
                <span className="text-gold">+{job.goldReward} זהב</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      </div>
    </SceneBackdrop>
  );
}
