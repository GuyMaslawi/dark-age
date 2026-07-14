import { redirect } from "next/navigation";
import { ClanRole, prisma } from "@kingdom/db";
import { CLAN_CREATION_COST } from "@kingdom/game-engine";
import { requireUser, getCurrentCharacter } from "@/lib/session";
import { ClanHome, type ClanMemberView } from "./ClanHome";
import { ClanLobby, type ClanDirectoryEntry, type InviteView } from "./ClanLobby";

const ROLE_WEIGHT: Record<ClanRole, number> = {
  LEADER: 0,
  OFFICER: 1,
  MEMBER: 2,
};

export default async function ClanPage() {
  const user = await requireUser();
  const character = await getCurrentCharacter(user.id);
  if (!character) {
    redirect("/character");
  }

  if (character.clanMembership) {
    const clanId = character.clanMembership.clanId;
    const [clan, invites] = await Promise.all([
      prisma.clan.findUniqueOrThrow({
        where: { id: clanId },
        include: {
          members: {
            include: { character: { select: { id: true, name: true, level: true, pvpWins: true } } },
          },
        },
      }),
      prisma.clanInvite.findMany({
        where: { clanId },
        include: { character: { select: { name: true } } },
      }),
    ]);

    const members: ClanMemberView[] = clan.members
      .map((member) => ({
        characterId: member.character.id,
        name: member.character.name,
        level: member.character.level,
        pvpWins: member.character.pvpWins,
        role: member.role,
      }))
      .sort((a, b) => ROLE_WEIGHT[a.role] - ROLE_WEIGHT[b.role] || b.level - a.level);

    return (
      <ClanHome
        clan={{ id: clan.id, name: clan.name, tag: clan.tag, description: clan.description, treasury: clan.treasury }}
        members={members}
        myRole={character.clanMembership.role}
        myGold={character.gold}
        pendingInvites={invites.map((invite) => invite.character.name)}
      />
    );
  }

  const [invites, directory] = await Promise.all([
    prisma.clanInvite.findMany({
      where: { characterId: character.id },
      include: { clan: { select: { id: true, name: true, tag: true } } },
    }),
    prisma.clan.findMany({
      orderBy: { treasury: "desc" },
      take: 20,
      include: { _count: { select: { members: true } } },
    }),
  ]);

  const inviteViews: InviteView[] = invites.map((invite) => ({
    clanId: invite.clan.id,
    name: invite.clan.name,
    tag: invite.clan.tag,
  }));

  const directoryViews: ClanDirectoryEntry[] = directory.map((clan) => ({
    id: clan.id,
    name: clan.name,
    tag: clan.tag,
    treasury: clan.treasury,
    memberCount: clan._count.members,
  }));

  return (
    <ClanLobby
      invites={inviteViews}
      directory={directoryViews}
      myGold={character.gold}
      creationCost={CLAN_CREATION_COST}
    />
  );
}
