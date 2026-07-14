export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gold">
            ממלכת האופל
          </h1>
          <p className="mt-2 text-sm text-void-edge/90 text-neutral-400">
            עולם של קרב, ברזל וגורל
          </p>
        </div>
        {children}
      </div>
    </main>
  );
}
