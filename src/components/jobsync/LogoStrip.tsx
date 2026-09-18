export function LogoMark({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 3)
    .toUpperCase();

  return (
    <div className="flex h-16 shrink-0 items-center gap-3 rounded-2xl border border-border bg-card px-6">
      <span
        aria-hidden="true"
        className="grid h-8 w-8 place-items-center rounded-lg bg-secondary text-[11px] font-extrabold text-secondary-foreground"
      >
        {initials}
      </span>
      <span className="whitespace-nowrap text-sm font-semibold text-muted-foreground">
        {name}
      </span>
    </div>
  );
}

export function LogoMarquee({ items }: { items: string[] }) {
  const doubled = [...items, ...items];
  return (
    <div
      className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]"
      aria-hidden="true"
    >
      <div className="flex w-max gap-4 animate-marquee">
        {doubled.map((name, i) => (
          <LogoMark key={`${name}-${i}`} name={name} />
        ))}
      </div>
    </div>
  );
}
