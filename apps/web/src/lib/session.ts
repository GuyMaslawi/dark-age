import { redirect } from "next/navigation";
import { prisma } from "@kingdom/db";
import { auth } from "@/auth";

export async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }
  return session.user;
}

export async function getCurrentCharacter(userId: string) {
  return prisma.character.findUnique({
    where: { userId },
    include: { location: true },
  });
}
