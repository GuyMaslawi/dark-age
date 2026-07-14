import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma, type BattleResult } from "@kingdom/db";
import { requireUser, getCurrentCharacter } from "@/lib/session";
import type { BattleLogData } from "@/lib/battleLog";

const resultBadge: Record<BattleResult, { text: string; className: string }> = {
  ATTACKER_WIN: { text: "ניצחון", className: "text-gold border-gold/40 bg-gold/10" },
  DEFENDER_WIN: { text: "הפסד", className: "text-red-300 border-blood/40 bg-blood/10" },
  DRAW: { text: "תיקו", className: "text-neutral-300 border-void-edge" },
};

export default async function BattlesPage() {
  const user = await requireUser();
  const character = await getCurrentCharacter(user.id);
  if (!character) {
    redirect("/character");
  }

  const battles = await prisma.battle.findMany({
    where: { attackerId: character.id },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-2xl font-bold text-gold">יומן קרבות</h1>

      {battles.length === 0 ? (
        <div className="panel p-8 text-center text-neutral-400">
          עדיין לא נלחמת. צא ל
          <Link href="/world" className="text-gold hover:text-gold-bright">
            עולם
          </Link>{" "}
          כדי להתחיל.
        </div>
      ) : (
        <ul className="space-y-2">
          {battles.map((battle) => {
            const log = battle.log as unknown as BattleLogData;
            const badge = resultBadge[battle.result];
            return (
              <li key={battle.id}>
                <Link
                  href={`/battles/${battle.id}`}
                  className="panel flex items-center justify-between gap-3 p-3 transition-colors hover:border-gold/40"
                >
                  <div className="min-w-0">
                    <div className="truncate font-medium">מול {log.defender.name}</div>
                    <div className="text-xs text-neutral-500">
                      ניסיון +{battle.xpGained}
                      {battle.goldGained > 0 && ` · זהב +${battle.goldGained}`}
                      {log.rewards.lootName && ` · שלל: ${log.rewards.lootName}`}
                    </div>
                  </div>
                  <span
                    className={`shrink-0 rounded-full border px-3 py-1 text-xs ${badge.className}`}
                  >
                    {badge.text}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
