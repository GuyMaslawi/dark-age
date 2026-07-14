import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@kingdom/db";
import { requireUser, getCurrentCharacter } from "@/lib/session";
import { Avatar } from "@/components/Avatar";
import { EQUIP_SLOTS } from "@/lib/equipment";
import { rarityMeta } from "@/lib/rarity";

export default async function PlayerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const viewer = await getCurrentCharacter(user.id);
  const { id } = await params;

  const character = await prisma.character.findUnique({
    where: { id },
    include: {
      location: true,
      inventory: {
        where: { equippedSlot: { not: null } },
        include: { item: true },
      },
    },
  });
  if (!character) {
    notFound();
  }

  const equippedBySlot = new Map(
    character.inventory.map((entry) => [entry.equippedSlot, entry]),
  );

  const battles = character.pvpWins + character.pvpLosses;
  const winRate = battles > 0 ? Math.round((character.pvpWins / battles) * 100) : 0;

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div className="panel flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
        <Avatar avatarKey={character.avatarKey} gender={character.gender} size={96} />
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gold">{character.name}</h1>
          <p className="text-sm text-neutral-400">
            רמה {character.level}.{character.subLevel} · {character.location.name}
          </p>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm">
            <span className="text-neutral-300">
              נצחונות PvE: <span className="text-gold-bright">{character.pveWins}</span>
            </span>
            <span className="text-neutral-300">
              נצחונות PvP: <span className="text-gold-bright">{character.pvpWins}</span>
            </span>
            <span className="text-neutral-300">
              הפסדים: <span className="text-gold-bright">{character.pvpLosses}</span>
            </span>
            {battles > 0 && (
              <span className="text-neutral-300">
                אחוז נצחון: <span className="text-gold-bright">{winRate}%</span>
              </span>
            )}
          </div>
          {viewer && viewer.id !== character.id && (
            <Link
              href={`/chat?to=${character.id}`}
              className="btn-ghost mt-4 inline-block text-sm"
            >
              שלח הודעה
            </Link>
          )}
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-gold">ציוד</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {EQUIP_SLOTS.map(({ slot, label }) => {
            const entry = equippedBySlot.get(slot);
            const meta = entry ? rarityMeta[entry.item.rarity] : null;
            return (
              <div
                key={slot}
                className={`rounded-lg border p-3 ${
                  meta ? meta.border : "border-void-edge border-dashed"
                }`}
              >
                <div className="mb-1 text-[11px] text-neutral-500">{label}</div>
                {entry ? (
                  <div className={`text-sm font-medium ${meta?.text}`}>
                    {entry.item.name}
                  </div>
                ) : (
                  <div className="text-sm text-neutral-600">ריק</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
