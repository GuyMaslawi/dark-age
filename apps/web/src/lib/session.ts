import { redirect } from "next/navigation";
import { prisma } from "@kingdom/db";
import { auth } from "@/auth";
import { withRegen } from "@/lib/regen";

export async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }
  return session.user;
}

export async function getCurrentCharacter(userId: string) {
  const character = await prisma.character.findUnique({
    where: { userId },
    include: {
      location: true,
      clanMembership: { include: { clan: { select: { id: true, name: true, tag: true } } } },
    },
  });
  if (!character) {
    return null;
  }
  return withRegen(character, new Date());
}
