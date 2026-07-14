"use client";

import Link from "next/link";
import { ActionForm } from "./ActionForm";
import {
  acceptInviteAction,
  createClanAction,
  declineInviteAction,
} from "./actions";

export type InviteView = { clanId: string; name: string; tag: string };
export type ClanDirectoryEntry = {
  id: string;
  name: string;
  tag: string;
  treasury: number;
  memberCount: number;
};

export function ClanLobby({
  invites,
  directory,
  myGold,
  creationCost,
}: {
  invites: InviteView[];
  directory: ClanDirectoryEntry[];
  myGold: number;
  creationCost: number;
}) {
  const canAfford = myGold >= creationCost;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold text-gold">שבטים</h1>

      {invites.length > 0 && (
        <section>
          <h2 className="mb-2 text-lg font-semibold text-gold">הזמנות שקיבלת</h2>
          <ul className="space-y-2">
            {invites.map((invite) => (
              <li
                key={invite.clanId}
                className="panel flex items-center justify-between gap-3 p-3"
              >
                <span>
                  [{invite.tag}] {invite.name}
                </span>
                <div className="flex gap-2">
                  <ActionForm action={acceptInviteAction} label="הצטרף">
                    <input type="hidden" name="clanId" value={invite.clanId} />
                  </ActionForm>
                  <ActionForm
                    action={declineInviteAction}
                    label="דחה"
                    buttonClass="btn-ghost px-3 py-1 text-xs"
                  >
                    <input type="hidden" name="clanId" value={invite.clanId} />
                  </ActionForm>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="panel p-5">
        <h2 className="mb-1 text-lg font-semibold text-gold">הקם שבט חדש</h2>
        <p className="mb-4 text-sm text-neutral-400">
          עלות הקמה: {creationCost} זהב (יש לך {myGold})
        </p>
        <ActionForm action={createClanAction} label="הקם שבט" className="space-y-3">
          <div className="grid w-full gap-3 sm:grid-cols-2">
            <input name="name" placeholder="שם השבט" required maxLength={24} className="field" />
            <input name="tag" placeholder="תג (2-4)" required maxLength={4} className="field" />
          </div>
        </ActionForm>
        {!canAfford && (
          <p className="mt-2 text-xs text-neutral-500">אין לך מספיק זהב להקמת שבט.</p>
        )}
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold text-gold">שבטים מובילים</h2>
        {directory.length === 0 ? (
          <p className="text-sm text-neutral-500">עדיין אין שבטים.</p>
        ) : (
          <ul className="panel divide-y divide-void-edge/60">
            {directory.map((clan, index) => (
              <li key={clan.id} className="flex items-center gap-3 px-4 py-2.5">
                <span className="w-5 text-center text-sm text-neutral-500">{index + 1}</span>
                <Link href={`/clan/${clan.id}`} className="flex-1 truncate text-gold hover:text-gold-bright">
                  [{clan.tag}] {clan.name}
                </Link>
                <span className="text-xs text-neutral-400">{clan.memberCount} חברים</span>
                <span className="w-20 text-left text-xs text-gold">🪙 {clan.treasury}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
