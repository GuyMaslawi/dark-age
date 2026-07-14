import Link from "next/link";
import { SideNav } from "@/components/SideNav";
import { ResourceBars } from "@/components/ResourceBars";
import { SignOutButton } from "@/components/SignOutButton";
import { SocketProvider } from "@/components/SocketProvider";
import { requireUser, getCurrentCharacter } from "@/lib/session";
import { mintSocketToken, publicSocketUrl } from "@/lib/socket";

export default async function GameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  const character = await getCurrentCharacter(user.id);
  const socketToken = character ? mintSocketToken(character) : null;

  const shell = (
    <div className="flex min-h-dvh flex-col md:flex-row">
      <aside className="border-void-edge md:w-56 md:shrink-0 md:border-l">
        <div className="hidden items-center gap-2 px-4 py-4 md:flex">
          <span className="text-lg font-bold text-gold">ממלכת האופל</span>
        </div>
        <SideNav />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 border-b border-void-edge bg-void/80 px-4 py-3 backdrop-blur">
          <div className="flex items-center justify-between gap-4">
            {character ? (
              <ResourceBars character={character} />
            ) : (
              <Link href="/character" className="text-sm text-gold">
                עדיין אין לך דמות — צור אחת כדי להתחיל
              </Link>
            )}
            <SignOutButton />
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
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
