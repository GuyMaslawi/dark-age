"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Avatar } from "@/components/Avatar";
import { avatarOptions, DEFAULT_AVATAR_KEY } from "@/lib/avatars";
import { createCharacterAction, type CreateCharacterState } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-gold w-full" disabled={pending}>
      {pending ? "נוצר…" : "צור דמות"}
    </button>
  );
}

export function CreateCharacterForm() {
  const [state, formAction] = useActionState<CreateCharacterState, FormData>(
    createCharacterAction,
    { error: null },
  );
  const [gender, setGender] = useState<"MALE" | "FEMALE">("MALE");
  const [avatarKey, setAvatarKey] = useState(DEFAULT_AVATAR_KEY);

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-2 text-center text-2xl font-bold text-gold">
        צור את הדמות שלך
      </h1>
      <p className="mb-6 text-center text-sm text-neutral-400">
        השם הזה ילווה אותך בכל הממלכה — בחר בחוכמה.
      </p>

      <div className="panel mb-6 space-y-3 p-5">
        <h2 className="font-semibold text-gold">ברוך הבא לממלכת האופל</h2>
        <p className="text-sm text-neutral-400">
          צוד מפלצות בשמונה אזורים, אסוף ציוד ונשק, התמודד מול שחקנים אחרים,
          הצטרף לשבט ועלה לצמרת הדירוג. הנה ארבעת המאפיינים שיעצבו את הדמות שלך:
        </p>
        <ul className="grid grid-cols-2 gap-2 text-xs text-neutral-300">
          <li>
            <span className="text-gold-bright">כוח</span> — נזק בקרב
          </li>
          <li>
            <span className="text-gold-bright">בינה</span> — דיוק הפגיעה
          </li>
          <li>
            <span className="text-gold-bright">זריזות</span> — התחמקות ממכות
          </li>
          <li>
            <span className="text-gold-bright">סיבולת</span> — בריאות והגנה
          </li>
        </ul>
        <p className="text-xs text-neutral-500">
          תתחיל עם {5} נקודות לחלוקה חופשית, ותקבל עוד בכל עליית רמה.
        </p>
      </div>

      <form action={formAction} className="panel space-y-6 p-6">
        <div>
          <label htmlFor="name" className="mb-1 block text-sm text-neutral-300">
            שם הדמות
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            maxLength={16}
            className="field"
            placeholder="לדוגמה: אֵיתָן הנודד"
          />
        </div>

        <div>
          <span className="mb-2 block text-sm text-neutral-300">מגדר</span>
          <div className="grid grid-cols-2 gap-2">
            {(["MALE", "FEMALE"] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setGender(value)}
                className={`rounded-md border px-4 py-2 text-sm transition-colors ${
                  gender === value
                    ? "border-gold/60 bg-gold/15 text-gold-bright"
                    : "border-void-edge text-neutral-300 hover:border-gold/40"
                }`}
              >
                {value === "MALE" ? "זכר" : "נקבה"}
              </button>
            ))}
          </div>
          <input type="hidden" name="gender" value={gender} />
        </div>

        <div>
          <span className="mb-2 block text-sm text-neutral-300">אווטאר</span>
          <div className="grid grid-cols-3 gap-3">
            {avatarOptions.map((option) => (
              <button
                key={option.key}
                type="button"
                onClick={() => setAvatarKey(option.key)}
                className={`flex flex-col items-center gap-1 rounded-lg border p-2 transition-colors ${
                  avatarKey === option.key
                    ? "border-gold/60 bg-gold/10"
                    : "border-void-edge hover:border-gold/40"
                }`}
              >
                <Avatar avatarKey={option.key} gender={gender} size={64} />
                <span className="text-xs text-neutral-400">{option.label}</span>
              </button>
            ))}
          </div>
          <input type="hidden" name="avatarKey" value={avatarKey} />
        </div>

        {state.error && (
          <p className="rounded-md border border-blood/40 bg-blood/10 px-3 py-2 text-sm text-red-300">
            {state.error}
          </p>
        )}

        <SubmitButton />
      </form>
    </div>
  );
}
