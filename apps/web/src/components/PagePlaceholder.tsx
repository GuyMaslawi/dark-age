export function PagePlaceholder({
  icon,
  title,
  description,
  phase,
}: {
  icon: string;
  title: string;
  description: string;
  phase: string;
}) {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="panel p-8 text-center">
        <div className="mb-4 text-4xl" aria-hidden>
          {icon}
        </div>
        <h1 className="mb-2 text-2xl font-bold text-gold">{title}</h1>
        <p className="mx-auto max-w-md text-neutral-400">{description}</p>
        <p className="mt-6 inline-block rounded-full border border-void-edge px-3 py-1 text-xs text-neutral-500">
          {phase}
        </p>
      </div>
    </div>
  );
}
