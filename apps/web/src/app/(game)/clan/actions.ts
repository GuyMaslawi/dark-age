"use server";

import { revalidatePath } from "next/cache";
import { ClanRole, Prisma, prisma } from "@kingdom/db";
import { CLAN_CREATION_COST } from "@kingdom/game-engine";
import { requireUser } from "@/lib/session";
import { createClanSchema } from "@/lib/validation";

export type ClanActionState = {
  error: string | null;
  notice: string | null;
};

const ERRORS: Record<string, string> = {
  NO_CHARACTER: "עדיין אין לך דמות",
  ALREADY_IN_CLAN: "אתה כבר חבר בשבט",
  NO_GOLD: "אין לך מספיק זהב",
  NAME_TAKEN: "השם או התג כבר תפוסים",
  NOT_MEMBER: "אינך חבר בשבט",
  NOT_ALLOWED: "אין לך הרשאה לפעולה זו",
  TARGET_NOT_FOUND: "השחקן לא נמצא",
  TARGET_IN_CLAN: "השחקן כבר חבר בשבט",
  ALREADY_INVITED: "השחקן כבר הוזמן",
  NO_INVITE: "אין הזמנה מתאימה",
  LEADER_LEAVE: "מנהיג לא יכול לעזוב — העבר מנהיגות או פרק את השבט",
  CANNOT_TARGET_LEADER: "אי אפשר לבצע פעולה זו על המנהיג",
  BAD_AMOUNT: "סכום לא תקין",
  INSUFFICIENT_TREASURY: "אין מספיק זהב באוצר",
};

function ok(notice: string): ClanActionState {
  return { error: null, notice };
}

function fail(message: string): ClanActionState {
  return { error: ERRORS[message] ?? "שגיאה", notice: null };
}

async function actorMembership(userId: string) {
  const character = await prisma.character.findUnique({
    where: { userId },
    include: { clanMembership: true },
  });
  return character;
}

export async function createClanAction(
  _prev: ClanActionState,
  formData: FormData,
): Promise<ClanActionState> {
  const user = await requireUser();
  const parsed = createClanSchema.safeParse({
    name: formData.get("name"),
    tag: formData.get("tag"),
    description: formData.get("description") ?? undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "נתונים לא תקינים", notice: null };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const character = await tx.character.findUnique({
        where: { userId: user.id },
        include: { clanMembership: true },
      });
      if (!character) throw new Error("NO_CHARACTER");
      if (character.clanMembership) throw new Error("ALREADY_IN_CLAN");
      if (character.gold < CLAN_CREATION_COST) throw new Error("NO_GOLD");

      const clan = await tx.clan.create({
        data: {
          name: parsed.data.name,
          tag: parsed.data.tag,
          description: parsed.data.description ?? "",
        },
      });
      await tx.character.update({
        where: { id: character.id },
        data: { gold: { decrement: CLAN_CREATION_COST } },
      });
      await tx.clanMember.create({
        data: { clanId: clan.id, characterId: character.id, role: ClanRole.LEADER },
      });
      await tx.clanInvite.deleteMany({ where: { characterId: character.id } });
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return fail("NAME_TAKEN");
    }
    if (error instanceof Error && ERRORS[error.message]) {
      return fail(error.message);
    }
    throw error;
  }

  revalidatePath("/", "layout");
  return ok("השבט נוצר");
}

export async function inviteMemberAction(
  _prev: ClanActionState,
  formData: FormData,
): Promise<ClanActionState> {
  const user = await requireUser();
  const targetName = String(formData.get("targetName") ?? "").trim();

  try {
    await prisma.$transaction(async (tx) => {
      const actor = await tx.character.findUnique({
        where: { userId: user.id },
        include: { clanMembership: true },
      });
      if (!actor?.clanMembership) throw new Error("NOT_MEMBER");
      if (
        actor.clanMembership.role !== ClanRole.LEADER &&
        actor.clanMembership.role !== ClanRole.OFFICER
      ) {
        throw new Error("NOT_ALLOWED");
      }

      const target = await tx.character.findUnique({
        where: { name: targetName },
        include: { clanMembership: true },
      });
      if (!target) throw new Error("TARGET_NOT_FOUND");
      if (target.clanMembership) throw new Error("TARGET_IN_CLAN");

      const existing = await tx.clanInvite.findUnique({
        where: {
          clanId_characterId: {
            clanId: actor.clanMembership.clanId,
            characterId: target.id,
          },
        },
      });
      if (existing) throw new Error("ALREADY_INVITED");

      await tx.clanInvite.create({
        data: { clanId: actor.clanMembership.clanId, characterId: target.id },
      });
    });
  } catch (error) {
    if (error instanceof Error && ERRORS[error.message]) {
      return fail(error.message);
    }
    throw error;
  }

  revalidatePath("/clan");
  return ok("ההזמנה נשלחה");
}

export async function acceptInviteAction(
  _prev: ClanActionState,
  formData: FormData,
): Promise<ClanActionState> {
  const user = await requireUser();
  const clanId = String(formData.get("clanId") ?? "");

  try {
    await prisma.$transaction(async (tx) => {
      const character = await tx.character.findUnique({
        where: { userId: user.id },
        include: { clanMembership: true },
      });
      if (!character) throw new Error("NO_CHARACTER");
      if (character.clanMembership) throw new Error("ALREADY_IN_CLAN");

      const invite = await tx.clanInvite.findUnique({
        where: { clanId_characterId: { clanId, characterId: character.id } },
      });
      if (!invite) throw new Error("NO_INVITE");

      await tx.clanMember.create({
        data: { clanId, characterId: character.id, role: ClanRole.MEMBER },
      });
      await tx.clanInvite.deleteMany({ where: { characterId: character.id } });
    });
  } catch (error) {
    if (error instanceof Error && ERRORS[error.message]) {
      return fail(error.message);
    }
    throw error;
  }

  revalidatePath("/", "layout");
  return ok("הצטרפת לשבט");
}

export async function declineInviteAction(
  _prev: ClanActionState,
  formData: FormData,
): Promise<ClanActionState> {
  const user = await requireUser();
  const clanId = String(formData.get("clanId") ?? "");
  const character = await actorMembership(user.id);
  if (character) {
    await prisma.clanInvite.deleteMany({
      where: { clanId, characterId: character.id },
    });
  }
  revalidatePath("/clan");
  return ok("ההזמנה נדחתה");
}

export async function leaveClanAction(
  _prev: ClanActionState,
): Promise<ClanActionState> {
  const user = await requireUser();
  try {
    await prisma.$transaction(async (tx) => {
      const character = await tx.character.findUnique({
        where: { userId: user.id },
        include: { clanMembership: true },
      });
      if (!character?.clanMembership) throw new Error("NOT_MEMBER");

      if (character.clanMembership.role === ClanRole.LEADER) {
        const count = await tx.clanMember.count({
          where: { clanId: character.clanMembership.clanId },
        });
        if (count > 1) throw new Error("LEADER_LEAVE");
        await tx.clan.delete({ where: { id: character.clanMembership.clanId } });
        return;
      }
      await tx.clanMember.delete({ where: { id: character.clanMembership.id } });
    });
  } catch (error) {
    if (error instanceof Error && ERRORS[error.message]) {
      return fail(error.message);
    }
    throw error;
  }
  revalidatePath("/", "layout");
  return ok("עזבת את השבט");
}

async function requireOfficerOrLeader(
  tx: Prisma.TransactionClient,
  userId: string,
) {
  const actor = await tx.character.findUnique({
    where: { userId },
    include: { clanMembership: true },
  });
  if (!actor?.clanMembership) throw new Error("NOT_MEMBER");
  return actor.clanMembership;
}

export async function kickMemberAction(
  _prev: ClanActionState,
  formData: FormData,
): Promise<ClanActionState> {
  const user = await requireUser();
  const targetCharacterId = String(formData.get("memberId") ?? "");
  try {
    await prisma.$transaction(async (tx) => {
      const membership = await requireOfficerOrLeader(tx, user.id);
      if (
        membership.role !== ClanRole.LEADER &&
        membership.role !== ClanRole.OFFICER
      ) {
        throw new Error("NOT_ALLOWED");
      }
      const target = await tx.clanMember.findUnique({
        where: { characterId: targetCharacterId },
      });
      if (!target || target.clanId !== membership.clanId) throw new Error("TARGET_NOT_FOUND");
      if (target.role === ClanRole.LEADER) throw new Error("CANNOT_TARGET_LEADER");
      if (target.role === ClanRole.OFFICER && membership.role !== ClanRole.LEADER) {
        throw new Error("NOT_ALLOWED");
      }
      await tx.clanMember.delete({ where: { id: target.id } });
    });
  } catch (error) {
    if (error instanceof Error && ERRORS[error.message]) {
      return fail(error.message);
    }
    throw error;
  }
  revalidatePath("/clan");
  return ok("החבר הוסר");
}

export async function setRoleAction(
  _prev: ClanActionState,
  formData: FormData,
): Promise<ClanActionState> {
  const user = await requireUser();
  const targetCharacterId = String(formData.get("memberId") ?? "");
  const role = formData.get("role") === "OFFICER" ? ClanRole.OFFICER : ClanRole.MEMBER;
  try {
    await prisma.$transaction(async (tx) => {
      const membership = await requireOfficerOrLeader(tx, user.id);
      if (membership.role !== ClanRole.LEADER) throw new Error("NOT_ALLOWED");
      const target = await tx.clanMember.findUnique({
        where: { characterId: targetCharacterId },
      });
      if (!target || target.clanId !== membership.clanId) throw new Error("TARGET_NOT_FOUND");
      if (target.role === ClanRole.LEADER) throw new Error("CANNOT_TARGET_LEADER");
      await tx.clanMember.update({ where: { id: target.id }, data: { role } });
    });
  } catch (error) {
    if (error instanceof Error && ERRORS[error.message]) {
      return fail(error.message);
    }
    throw error;
  }
  revalidatePath("/clan");
  return ok("התפקיד עודכן");
}

export async function depositTreasuryAction(
  _prev: ClanActionState,
  formData: FormData,
): Promise<ClanActionState> {
  const user = await requireUser();
  const amount = Number(formData.get("amount") ?? 0);
  if (!Number.isInteger(amount) || amount <= 0) {
    return fail("BAD_AMOUNT");
  }
  try {
    await prisma.$transaction(async (tx) => {
      const character = await tx.character.findUnique({
        where: { userId: user.id },
        include: { clanMembership: true },
      });
      if (!character?.clanMembership) throw new Error("NOT_MEMBER");
      if (character.gold < amount) throw new Error("NO_GOLD");
      await tx.character.update({
        where: { id: character.id },
        data: { gold: { decrement: amount } },
      });
      await tx.clan.update({
        where: { id: character.clanMembership.clanId },
        data: { treasury: { increment: amount } },
      });
    });
  } catch (error) {
    if (error instanceof Error && ERRORS[error.message]) {
      return fail(error.message);
    }
    throw error;
  }
  revalidatePath("/", "layout");
  return ok("הפקדת לאוצר");
}

export async function withdrawTreasuryAction(
  _prev: ClanActionState,
  formData: FormData,
): Promise<ClanActionState> {
  const user = await requireUser();
  const amount = Number(formData.get("amount") ?? 0);
  if (!Number.isInteger(amount) || amount <= 0) {
    return fail("BAD_AMOUNT");
  }
  try {
    await prisma.$transaction(async (tx) => {
      const character = await tx.character.findUnique({
        where: { userId: user.id },
        include: { clanMembership: true },
      });
      if (!character?.clanMembership) throw new Error("NOT_MEMBER");
      if (character.clanMembership.role !== ClanRole.LEADER) throw new Error("NOT_ALLOWED");
      const clan = await tx.clan.findUniqueOrThrow({
        where: { id: character.clanMembership.clanId },
      });
      if (clan.treasury < amount) throw new Error("INSUFFICIENT_TREASURY");
      await tx.clan.update({ where: { id: clan.id }, data: { treasury: { decrement: amount } } });
      await tx.character.update({
        where: { id: character.id },
        data: { gold: { increment: amount } },
      });
    });
  } catch (error) {
    if (error instanceof Error && ERRORS[error.message]) {
      return fail(error.message);
    }
    throw error;
  }
  revalidatePath("/", "layout");
  return ok("משכת מהאוצר");
}

export async function disbandClanAction(
  _prev: ClanActionState,
): Promise<ClanActionState> {
  const user = await requireUser();
  try {
    await prisma.$transaction(async (tx) => {
      const character = await tx.character.findUnique({
        where: { userId: user.id },
        include: { clanMembership: true },
      });
      if (!character?.clanMembership) throw new Error("NOT_MEMBER");
      if (character.clanMembership.role !== ClanRole.LEADER) throw new Error("NOT_ALLOWED");
      await tx.clan.delete({ where: { id: character.clanMembership.clanId } });
    });
  } catch (error) {
    if (error instanceof Error && ERRORS[error.message]) {
      return fail(error.message);
    }
    throw error;
  }
  revalidatePath("/", "layout");
  return ok("השבט פורק");
}
