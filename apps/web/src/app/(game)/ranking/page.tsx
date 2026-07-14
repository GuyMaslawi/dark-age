import { prisma } from "@kingdom/db";
import { requireUser, getCurrentCharacter } from "@/lib/session";
import { RankingView, type RankRow } from "./RankingView";

export default async function RankingPage() {
  const user = await requireUser();
  const character = await getCurrentCharacter(user.id);

  const select = {
    id: true,
    name: true,
    level: true,
    subLevel: true,
    xp: true,
    pvpWins: true,
    pvpLosses: true,
  } as const;

  const [byLevel, byPvp] = await Promise.all([
    prisma.character.findMany({
      orderBy: [{ level: "desc" }, { xp: "desc" }],
      take: 50,
      select,
    }),
    prisma.character.findMany({
      orderBy: [{ pvpWins: "desc" }, { level: "desc" }],
      take: 50,
      select,
    }),
  ]);

  const toRows = (list: typeof byLevel): RankRow[] =>
    list.map((row) => ({
      id: row.id,
      name: row.name,
      level: row.level,
      subLevel: row.subLevel,
      xp: row.xp,
      pvpWins: row.pvpWins,
      pvpLosses: row.pvpLosses,
    }));

  return (
    <RankingView
      byLevel={toRows(byLevel)}
      byPvp={toRows(byPvp)}
      currentId={character?.id ?? null}
    />
  );
}
