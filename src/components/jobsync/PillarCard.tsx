import { Check, ArrowRight, type LucideIcon } from "lucide-react";

export function PillarCard({
  icon: Icon,
  eyebrow,
  title,
  description,
  features,
  cta,
}: {
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  description: string;
  features: string[];
  cta: string;
}) {
  return (
    <article className="group flex h-full flex-col rounded-3xl border border-border bg-card p-8 shadow-soft transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lift">
      <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-brand text-primary-foreground">
        <Icon className="h-6 w-6" aria-hidden="true" />
      </span>
      <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-primary">
        {eyebrow}
      </p>
      <h3 className="mt-2 text-2xl font-bold tracking-tight text-foreground">{title}</h3>
      <p className="mt-3 text-base leading-relaxed text-muted-foreground">{description}</p>
      <ul className="mt-6 space-y-3">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-3 text-sm text-foreground">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <a
        href="#contact"
        className="mt-8 inline-flex items-center gap-2 self-start rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:text-primary"
      >
        {cta}
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
      </a>
    </article>
  );
}
