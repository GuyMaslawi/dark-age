import { GameArt } from "@/components/GameArt";
import { LocationScene } from "@/components/art/LocationScene";
import { locationArtSrc } from "@/lib/art";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden px-4 py-10">
      <div className="pointer-events-none absolute inset-0">
        <GameArt
          src={locationArtSrc("town")}
          alt="ממלכת האופל"
          className="h-full w-full opacity-50 blur-[1px]"
          imgClassName="h-full w-full object-cover"
          fallback={<LocationScene slug="town" className="h-full w-full" />}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-void/80 via-void/75 to-void" />
      </div>

      <div className="relative z-10 w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gold drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
            ממלכת האופל
          </h1>
          <p className="mt-2 text-sm text-neutral-300 drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
            עולם של קרב, ברזל וגורל
          </p>
        </div>
        {children}
      </div>
    </main>
  );
}
