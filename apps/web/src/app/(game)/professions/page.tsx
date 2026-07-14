import { redirect } from "next/navigation";
import { ProfessionJobStatus, prisma } from "@kingdom/db";
import { PROFESSIONS, PROFESSION_KEYS, professionReward } from "@kingdom/game-engine";
import { requireUser, getCurrentCharacter } from "@/lib/session";
import { ProfessionsView, type ActiveJobView, type JobHistoryView } from "./ProfessionsView";

export default async function ProfessionsPage() {
  const user = await requireUser();
  const character = await getCurrentCharacter(user.id);
  if (!character) {
    redirect("/character");
  }

  const [active, history] = await Promise.all([
    prisma.professionJob.findFirst({
      where: { characterId: character.id, status: ProfessionJobStatus.ACTIVE },
    }),
    prisma.professionJob.findMany({
      where: { characterId: character.id, status: { not: ProfessionJobStatus.ACTIVE } },
      orderBy: { finishesAt: "desc" },
      take: 8,
    }),
  ]);

  const activeJob: ActiveJobView | null = active
    ? {
        type: active.type,
        label: PROFESSIONS[active.type].label,
        finishesAt: active.finishesAt.toISOString(),
        goldReward: active.goldReward,
      }
    : null;

  const historyView: JobHistoryView[] = history.map((job) => ({
    id: job.id,
    label: PROFESSIONS[job.type].label,
    goldReward: job.goldReward,
  }));

  const options = PROFESSION_KEYS.map((key) => ({
    key,
    label: PROFESSIONS[key].label,
    description: PROFESSIONS[key].description,
    durationMinutes: PROFESSIONS[key].durationMinutes,
    energyCost: PROFESSIONS[key].energyCost,
    reward: professionReward(key, character.level),
  }));

  return (
    <ProfessionsView
      options={options}
      activeJob={activeJob}
      history={historyView}
      energy={character.energy}
    />
  );
}
