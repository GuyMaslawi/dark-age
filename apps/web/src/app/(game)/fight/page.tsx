import { redirect } from "next/navigation";
import { prisma } from "@kingdom/db";
import { requireUser, getCurrentCharacter } from "@/lib/session";
import { toFightView, type FightState } from "@/lib/fight";
import { FightScreen } from "./FightScreen";

export default async function FightPage() {
  const user = await requireUser();
  const character = await getCurrentCharacter(user.id);
  if (!character) {
    redirect("/character");
  }

  const session = await prisma.combatSession.findUnique({
    where: { characterId: character.id },
  });
  if (!session) {
    redirect("/world");
  }

  const state = session.state as unknown as FightState;
  return <FightScreen initial={toFightView(state, null)} />;
}
