"use client";

import Link from "next/link";
import { ClanRole } from "@kingdom/db";
import { SceneBackdrop } from "@/components/scene/SceneBackdrop";
import { ActionForm } from "./ActionForm";
import {
  depositTreasuryAction,
  disbandClanAction,
  inviteMemberAction,
  kickMemberAction,
  leaveClanAction,
  setRoleAction,
  withdrawTreasuryAction,
} from "./actions";

export type ClanMemberView = {
  characterId: string;
  name: string;
  level: number;
  pvpWins: number;
  role: ClanRole;
};

const roleLabel: Record<ClanRole, string> = {
  LEADER: "מנהיג",
  OFFICER: "קצין",
  MEMBER: "חבר",
};

export function ClanHome({
  clan,
  members,
  myRole,
  myGold,
  pendingInvites,
}: {
  clan: { id: string; name: string; tag: string; description: string; treasury: number };
  members: ClanMemberView[];
  myRole: ClanRole;
  myGold: number;
  pendingInvites: string[];
}) {
  const isLeader = myRole === ClanRole.LEADER;
  const isOfficer = myRole === ClanRole.OFFICER || isLeader;

  return (
    <SceneBackdrop slug="keep" icon="🏰" title="הטירה" maxWidth="max-w-3xl">
      <div className="space-y-6">
      <div className="panel p-5">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gold">
            [{clan.tag}] {clan.name}
          </h1>
          <span className="text-sm text-gold">🪙 אוצר: {clan.treasury}</span>
        </div>
        {clan.description && <p className="mt-2 text-sm text-neutral-400">{clan.description}</p>}
      </div>

      <section>
        <h2 className="mb-2 text-lg font-semibold text-gold">חברים ({members.length})</h2>
        <ul className="panel divide-y divide-void-edge/60">
          {members.map((member) => (
            <li key={member.characterId} className="flex items-center gap-3 px-4 py-2.5">
              <Link
                href={`/player/${member.characterId}`}
                className="flex-1 truncate text-gold hover:text-gold-bright"
              >
                {member.name}
              </Link>
              <span className="text-xs text-neutral-500">רמה {member.level}</span>
              <span
                className={`w-14 text-center text-xs ${
                  member.role === "LEADER" ? "text-amber-400" : "text-neutral-400"
                }`}
              >
                {roleLabel[member.role]}
              </span>
              {member.role !== ClanRole.LEADER && (
                <div className="flex gap-1">
                  {isLeader && member.role === ClanRole.MEMBER && (
                    <ActionForm action={setRoleAction} label="קדם" buttonClass="btn-ghost px-2 py-0.5 text-[11px]">
                      <input type="hidden" name="memberId" value={member.characterId} />
                      <input type="hidden" name="role" value="OFFICER" />
                    </ActionForm>
                  )}
                  {isLeader && member.role === ClanRole.OFFICER && (
                    <ActionForm action={setRoleAction} label="הורד" buttonClass="btn-ghost px-2 py-0.5 text-[11px]">
                      <input type="hidden" name="memberId" value={member.characterId} />
                      <input type="hidden" name="role" value="MEMBER" />
                    </ActionForm>
                  )}
                  {isOfficer && (
                    <ActionForm
                      action={kickMemberAction}
                      label="הסר"
                      buttonClass="rounded-md border border-blood/40 px-2 py-0.5 text-[11px] text-red-300"
                    >
                      <input type="hidden" name="memberId" value={member.characterId} />
                    </ActionForm>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      </section>

      {isOfficer && (
        <section className="panel p-5">
          <h2 className="mb-2 text-lg font-semibold text-gold">הזמן חבר</h2>
          <ActionForm action={inviteMemberAction} label="הזמן">
            <input name="targetName" placeholder="שם הדמות" required className="field" />
          </ActionForm>
          {pendingInvites.length > 0 && (
            <p className="mt-2 text-xs text-neutral-500">
              הזמנות ממתינות: {pendingInvites.join(", ")}
            </p>
          )}
        </section>
      )}

      <section className="panel p-5">
        <h2 className="mb-3 text-lg font-semibold text-gold">אוצר השבט</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <ActionForm action={depositTreasuryAction} label="הפקד">
            <input
              name="amount"
              type="number"
              min={1}
              placeholder={`הפקד (יש לך ${myGold})`}
              className="field"
            />
          </ActionForm>
          {isLeader && (
            <ActionForm action={withdrawTreasuryAction} label="משוך" buttonClass="btn-ghost px-3 py-1 text-xs">
              <input name="amount" type="number" min={1} placeholder="משוך מהאוצר" className="field" />
            </ActionForm>
          )}
        </div>
      </section>

      <section className="flex gap-3">
        <ActionForm
          action={leaveClanAction}
          label="עזוב שבט"
          buttonClass="rounded-md border border-void-edge px-4 py-2 text-sm text-neutral-300 hover:border-blood/60 hover:text-red-300"
        />
        {isLeader && (
          <ActionForm
            action={disbandClanAction}
            label="פרק שבט"
            buttonClass="rounded-md border border-blood/50 px-4 py-2 text-sm text-red-300"
          />
        )}
      </section>
      </div>
    </SceneBackdrop>
  );
}
