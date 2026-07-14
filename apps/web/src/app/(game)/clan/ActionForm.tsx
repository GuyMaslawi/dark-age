"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { ClanActionState } from "./actions";

type ClanAction = (
  prev: ClanActionState,
  formData: FormData,
) => Promise<ClanActionState>;

function Pending({ label, className }: { label: string; className: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={className}>
      {pending ? "…" : label}
    </button>
  );
}

export function ActionForm({
  action,
  label,
  buttonClass = "btn-gold px-3 py-1 text-xs",
  className = "",
  children,
}: {
  action: ClanAction;
  label: string;
  buttonClass?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  const [state, formAction] = useActionState<ClanActionState, FormData>(action, {
    error: null,
    notice: null,
  });
  return (
    <form action={formAction} className={className}>
      <div className="flex items-center gap-2">
        {children}
        <Pending label={label} className={buttonClass} />
      </div>
      {state.error && <p className="mt-1 text-xs text-red-300">{state.error}</p>}
      {state.notice && <p className="mt-1 text-xs text-emerald-400">{state.notice}</p>}
    </form>
  );
}
