import Link from "next/link";
import { notFound } from "next/navigation";
import { ClanRole, prisma } from "@kingdom/db";
import { requireUser } from "@/lib/session";

const roleLabel: Record<ClanRole, string> = {
  LEADER: "מנהיג",
  OFFICER: "קצין",
  MEMBER: "חבר",
};

const ROLE_WEIGHT: Record<ClanRole, number> = { LEADER: 0, OFFICER: 1, MEMBER: 2 };

export default async function PublicClanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireUser();
  const { id } = await params;

  const clan = await prisma.clan.findUnique({
    where: { id },
    include: {
      members: {
        include: { character: { select: { id: true, name: true, level: true } } },
      },
    },
  });
  if (!clan) {
    notFound();
  }

  const members = [...clan.members].sort(
    (a, b) => ROLE_WEIGHT[a.role] - ROLE_WEIGHT[b.role] || b.character.level - a.character.level,
  );

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div className="panel p-5">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gold">
            [{clan.tag}] {clan.name}
          </h1>
          <span className="text-sm text-gold">🪙 {clan.treasury}</span>
        </div>
        {clan.description && <p className="mt-2 text-sm text-neutral-400">{clan.description}</p>}
      </div>

      <div>
        <h2 className="mb-2 text-lg font-semibold text-gold">חברים ({members.length})</h2>
        <ul className="panel divide-y divide-void-edge/60">
          {members.map((member) => (
            <li key={member.character.id} className="flex items-center gap-3 px-4 py-2.5">
              <Link
                href={`/player/${member.character.id}`}
                className="flex-1 truncate text-gold hover:text-gold-bright"
              >
                {member.character.name}
              </Link>
              <span className="text-xs text-neutral-500">רמה {member.character.level}</span>
              <span
                className={`w-14 text-center text-xs ${
                  member.role === "LEADER" ? "text-amber-400" : "text-neutral-400"
                }`}
              >
                {roleLabel[member.role]}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
