import { Quote } from "lucide-react";

export type Testimonial = {
  quote: string;
  name: string;
  title: string;
  institution: string;
  initials: string;
};

export function TestimonialCard({ t }: { t: Testimonial }) {
  return (
    <figure className="flex h-full flex-col rounded-3xl border border-border bg-card p-8 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift">
      <Quote className="h-7 w-7 text-accent" aria-hidden="true" />
      <blockquote className="mt-5 flex-1 text-base leading-relaxed text-foreground">
        &ldquo;{t.quote}&rdquo;
      </blockquote>
      <figcaption className="mt-7 flex min-w-0 items-center gap-4 border-t border-border pt-6">
        <span
          aria-hidden="true"
          className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gradient-brand text-sm font-bold text-primary-foreground"
        >
          {t.initials}
        </span>
        <span className="min-w-0">
          <span className="block truncate font-semibold text-foreground">{t.name}</span>
          <span className="block truncate text-sm text-muted-foreground">{t.title}</span>
          <span className="block truncate text-sm text-primary">{t.institution}</span>
        </span>
      </figcaption>
    </figure>
  );
}
