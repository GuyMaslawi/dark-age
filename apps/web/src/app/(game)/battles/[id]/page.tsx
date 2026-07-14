import { notFound, redirect } from "next/navigation";
import { prisma } from "@kingdom/db";
import { requireUser, getCurrentCharacter } from "@/lib/session";
import type { BattleLogData } from "@/lib/battleLog";
import { BattleReplay } from "./BattleReplay";

export default async function BattlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const character = await getCurrentCharacter(user.id);
  if (!character) {
    redirect("/character");
  }

  const { id } = await params;
  const battle = await prisma.battle.findUnique({ where: { id } });
  if (!battle || battle.attackerId !== character.id) {
    notFound();
  }

  const log = battle.log as unknown as BattleLogData;

  return <BattleReplay log={log} />;
}
