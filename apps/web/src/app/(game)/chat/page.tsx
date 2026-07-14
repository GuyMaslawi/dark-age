import { redirect } from "next/navigation";
import { MessageChannel, prisma } from "@kingdom/db";
import { requireUser, getCurrentCharacter } from "@/lib/session";
import { ChatView, type ChatMessageView } from "./ChatView";

export default async function ChatPage({
  searchParams,
}: {
  searchParams: Promise<{ to?: string }>;
}) {
  const user = await requireUser();
  const character = await getCurrentCharacter(user.id);
  if (!character) {
    redirect("/character");
  }

  const { to } = await searchParams;

  const globalRaw = await prisma.message.findMany({
    where: { channel: MessageChannel.GLOBAL },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { sender: { select: { name: true } } },
  });

  const toView = (row: (typeof globalRaw)[number]): ChatMessageView => ({
    id: row.id,
    senderId: row.senderId,
    senderName: row.sender.name,
    recipientId: row.recipientId,
    body: row.body,
    createdAt: row.createdAt.toISOString(),
  });

  const globalMessages = globalRaw.reverse().map(toView);

  let clan: { name: string } | null = null;
  let clanMessages: ChatMessageView[] = [];
  if (character.clanMembership) {
    clan = { name: character.clanMembership.clan.name };
    const clanRaw = await prisma.message.findMany({
      where: { channel: MessageChannel.CLAN, clanId: character.clanMembership.clanId },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { sender: { select: { name: true } } },
    });
    clanMessages = clanRaw.reverse().map(toView);
  }

  let partner: { id: string; name: string } | null = null;
  let privateMessages: ChatMessageView[] = [];
  if (to && to !== character.id) {
    const found = await prisma.character.findUnique({
      where: { id: to },
      select: { id: true, name: true },
    });
    if (found) {
      partner = found;
      const privateRaw = await prisma.message.findMany({
        where: {
          channel: MessageChannel.PRIVATE,
          OR: [
            { senderId: character.id, recipientId: to },
            { senderId: to, recipientId: character.id },
          ],
        },
        orderBy: { createdAt: "desc" },
        take: 50,
        include: { sender: { select: { name: true } } },
      });
      privateMessages = privateRaw.reverse().map(toView);
    }
  }

  return (
    <ChatView
      currentId={character.id}
      globalMessages={globalMessages}
      clan={clan}
      clanMessages={clanMessages}
      partner={partner}
      privateMessages={privateMessages}
    />
  );
}
