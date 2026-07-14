import Link from "next/link";
import { prisma, MessageChannel } from "@kingdom/db";
import { SceneNav } from "@/components/SceneNav";
import { RouteScene } from "@/components/RouteScene";
import { LiveResourceBars } from "@/components/LiveResourceBars";
import { SignOutButton } from "@/components/SignOutButton";
import { SocketProvider } from "@/components/SocketProvider";
import { ChatDock, type DockMessage } from "@/components/ChatDock";
import { requireUser, getCurrentCharacter } from "@/lib/session";
import { mintSocketToken, publicSocketUrl } from "@/lib/socket";

export default async function GameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  const character = await getCurrentCharacter(user.id);
  const socketToken = character
    ? mintSocketToken({
        id: character.id,
        name: character.name,
        clanId: character.clanMembership?.clanId ?? null,
      })
    : null;

  let dockMessages: DockMessage[] = [];
  if (character) {
    const recent = await prisma.message.findMany({
      where: { channel: MessageChannel.GLOBAL },
      orderBy: { createdAt: "desc" },
      take: 30,
      include: { sender: { select: { name: true } } },
    });
    dockMessages = recent
      .reverse()
      .map((message) => ({
        id: message.id,
        senderId: message.senderId,
        senderName: message.sender.name,
        body: message.body,
      }));
  }

  const shell = (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-50 border-b border-void-edge bg-void/80 px-4 py-3 backdrop-blur">
        <div className="flex items-center justify-between gap-4">
          {character ? (
            <LiveResourceBars
              character={{
                name: character.name,
                level: character.level,
                subLevel: character.subLevel,
                hp: character.hp,
                maxHp: character.maxHp,
                hpUpdatedAt: character.hpUpdatedAt.toISOString(),
                energy: character.energy,
                maxEnergy: character.maxEnergy,
                energyUpdatedAt: character.energyUpdatedAt.toISOString(),
                xp: character.xp,
                gold: character.gold,
              }}
            />
          ) : (
            <Link href="/character" className="text-sm text-gold">
              עדיין אין לך דמות — צור אחת כדי להתחיל
            </Link>
          )}
          <SignOutButton />
        </div>
      </header>

      <RouteScene />
      <main className="relative z-10 min-w-0 flex-1 p-4 pb-24 md:p-6 md:pb-24">{children}</main>

      {character && <SceneNav />}
      {character && <ChatDock currentId={character.id} initialMessages={dockMessages} />}
    </div>
  );

  if (socketToken) {
    return (
      <SocketProvider token={socketToken} url={publicSocketUrl()}>
        {shell}
      </SocketProvider>
    );
  }
  return shell;
}
