"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma, prisma } from "@kingdom/db";
import {
  STAT_KEYS,
  STARTING_GOLD,
  STARTING_POINTS,
  maxEnergyFor,
  maxHpFor,
  type StatKey,
} from "@kingdom/game-engine";
import { requireUser } from "@/lib/session";
import { createCharacterSchema } from "@/lib/validation";
import { avatarFor } from "@/lib/avatars";

export type CreateCharacterState = {
  error: string | null;
};

const STARTING_LOCATION_SLUG = "misty-vale";

export async function createCharacterAction(
  _prev: CreateCharacterState,
  formData: FormData,
): Promise<CreateCharacterState> {
  const user = await requireUser();

  const parsed = createCharacterSchema.safeParse({
    name: formData.get("name"),
    gender: formData.get("gender"),
    avatarKey: formData.get("avatarKey"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "נתונים לא תקינים" };
  }

  const avatar = avatarFor(parsed.data.avatarKey);
  const startLocation = await prisma.location.findUnique({
    where: { slug: STARTING_LOCATION_SLUG },
  });
  if (!startLocation) {
    return { error: "אזור ההתחלה אינו זמין" };
  }

  const maxHp = maxHpFor(5, 1);
  const maxEnergy = maxEnergyFor(1);

  try {
    await prisma.$transaction(async (tx) => {
      const existing = await tx.character.findUnique({
        where: { userId: user.id },
      });
      if (existing) {
        throw new Error("ALREADY_HAS_CHARACTER");
      }
      await tx.character.create({
        data: {
          userId: user.id,
          name: parsed.data.name,
          gender: parsed.data.gender,
          avatarKey: avatar.key,
          unspentPoints: STARTING_POINTS,
          gold: STARTING_GOLD,
          hp: maxHp,
          maxHp,
          energy: maxEnergy,
          maxEnergy,
          locationId: startLocation.id,
        },
      });
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { error: "השם הזה כבר תפוס, בחר שם אחר" };
    }
    if (error instanceof Error && error.message === "ALREADY_HAS_CHARACTER") {
      return { error: "כבר יש לך דמות" };
    }
    throw error;
  }

  revalidatePath("/", "layout");
  redirect("/character");
}

export type AllocateState = {
  error: string | null;
};

function isStatKey(value: unknown): value is StatKey {
  return typeof value === "string" && (STAT_KEYS as readonly string[]).includes(value);
}

export async function allocatePointAction(
  _prev: AllocateState,
  formData: FormData,
): Promise<AllocateState> {
  const user = await requireUser();
  const stat = formData.get("stat");
  if (!isStatKey(stat)) {
    return { error: "פרמטר לא תקין" };
  }

  const applied = await prisma.$transaction(async (tx) => {
    const character = await tx.character.findUnique({
      where: { userId: user.id },
    });
    if (!character) {
      throw new Error("NO_CHARACTER");
    }
    if (character.unspentPoints < 1) {
      return false;
    }

    const data: Prisma.CharacterUpdateInput = {
      [stat]: { increment: 1 },
      unspentPoints: { decrement: 1 },
    };

    if (stat === "endurance") {
      const nextMaxHp = maxHpFor(character.endurance + 1, character.level);
      data.maxHp = nextMaxHp;
      data.hp = Math.min(nextMaxHp, character.hp + (nextMaxHp - character.maxHp));
    }

    await tx.character.update({ where: { id: character.id }, data });
    return true;
  });

  if (!applied) {
    return { error: "אין לך נקודות פנויות" };
  }

  revalidatePath("/", "layout");
  return { error: null };
}
