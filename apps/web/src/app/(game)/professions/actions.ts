"use server";

import { revalidatePath } from "next/cache";
import { ProfessionJobStatus, ProfessionType, prisma } from "@kingdom/db";
import {
  PROFESSIONS,
  professionDurationMs,
  professionReward,
  type ProfessionKey,
} from "@kingdom/game-engine";
import { requireUser } from "@/lib/session";
import { syncRegen } from "@/lib/regen";

export type ProfessionActionState = {
  error: string | null;
};

const ERRORS: Record<string, string> = {
  NO_CHARACTER: "עדיין אין לך דמות",
  BAD_TYPE: "מקצוע לא תקין",
  HAS_ACTIVE: "כבר יש לך פעולה פעילה",
  NO_ENERGY: "אין לך מספיק אנרגיה",
};

function isProfessionKey(value: unknown): value is ProfessionKey {
  return typeof value === "string" && value in PROFESSIONS;
}

export async function startProfessionAction(
  _prev: ProfessionActionState,
  formData: FormData,
): Promise<ProfessionActionState> {
  const user = await requireUser();
  const type = formData.get("type");
  const now = new Date();

  if (!isProfessionKey(type)) {
    return { error: ERRORS.BAD_TYPE ?? "שגיאה" };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const character = await tx.character.findUnique({ where: { userId: user.id } });
      if (!character) throw new Error("NO_CHARACTER");
      await syncRegen(tx, character, now);

      const active = await tx.professionJob.count({
        where: { characterId: character.id, status: ProfessionJobStatus.ACTIVE },
      });
      if (active > 0) throw new Error("HAS_ACTIVE");

      const config = PROFESSIONS[type];
      if (character.energy < config.energyCost) throw new Error("NO_ENERGY");

      await tx.character.update({
        where: { id: character.id },
        data: {
          energy: { decrement: config.energyCost },
          energyUpdatedAt: now,
        },
      });

      await tx.professionJob.create({
        data: {
          characterId: character.id,
          type: type as ProfessionType,
          status: ProfessionJobStatus.ACTIVE,
          startedAt: now,
          finishesAt: new Date(now.getTime() + professionDurationMs(type)),
          goldReward: professionReward(type, character.level),
        },
      });
    });
  } catch (error) {
    if (error instanceof Error && ERRORS[error.message]) {
      return { error: ERRORS[error.message] ?? "שגיאה" };
    }
    throw error;
  }

  revalidatePath("/", "layout");
  return { error: null };
}
