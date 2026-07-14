"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { AuthActionState } from "./actions";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-gold w-full" disabled={pending}>
      {pending ? "רגע…" : label}
    </button>
  );
}

type AuthFormProps = {
  mode: "login" | "register";
  action: (
    prev: AuthActionState,
    formData: FormData,
  ) => Promise<AuthActionState>;
};

export function AuthForm({ mode, action }: AuthFormProps) {
  const [state, formAction] = useActionState<AuthActionState, FormData>(action, {
    error: null,
  });
  const isRegister = mode === "register";

  return (
    <div className="panel p-6">
      <h2 className="mb-6 text-center text-xl font-semibold">
        {isRegister ? "הרשמה" : "כניסה"}
      </h2>
      <form action={formAction} className="space-y-4">
        <div>
          <label htmlFor="email" className="mb-1 block text-sm text-neutral-300">
            אימייל
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="field"
            dir="ltr"
          />
        </div>
        <div>
          <label
            htmlFor="password"
            className="mb-1 block text-sm text-neutral-300"
          >
            סיסמה
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete={isRegister ? "new-password" : "current-password"}
            required
            className="field"
            dir="ltr"
          />
        </div>
        {isRegister && (
          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-1 block text-sm text-neutral-300"
            >
              אימות סיסמה
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              className="field"
              dir="ltr"
            />
          </div>
        )}
        {state.error && (
          <p className="rounded-md border border-blood/40 bg-blood/10 px-3 py-2 text-sm text-red-300">
            {state.error}
          </p>
        )}
        <SubmitButton label={isRegister ? "צור חשבון" : "היכנס"} />
      </form>
      <p className="mt-6 text-center text-sm text-neutral-400">
        {isRegister ? "כבר יש לך חשבון? " : "אין לך עדיין חשבון? "}
        <Link
          href={isRegister ? "/login" : "/register"}
          className="text-gold hover:text-gold-bright"
        >
          {isRegister ? "כניסה" : "הרשמה"}
        </Link>
      </p>
    </div>
  );
}
