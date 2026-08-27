import { GraduationCap, Building2, Users } from "lucide-react";
import logo from "@/assets/LOGO.png";

const nodes = [
  { icon: GraduationCap, label: "Colleges", pos: "left-0 top-6" },
  { icon: Building2, label: "Employers", pos: "right-0 top-20" },
  { icon: Users, label: "Students", pos: "bottom-4 left-1/2 -translate-x-1/2" },
];

export function HeroGraphic() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-md">
      <div
        aria-hidden="true"
        className="absolute inset-8 rounded-[3rem] bg-gradient-brand opacity-15 blur-2xl"
      />
      <div
        aria-hidden="true"
        className="absolute inset-10 rounded-[2.5rem] border border-border bg-card shadow-lift"
      />
      <img
        src={logo}
        alt="Khoranex connects colleges, employers and students"
        className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 object-contain sm:h-48 sm:w-48"
      />
      {nodes.map(({ icon: Icon, label, pos }) => (
        <div
          key={label}
          className={`absolute ${pos} flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 shadow-soft`}
        >
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-secondary text-primary">
            <Icon className="h-4 w-4" aria-hidden="true" />
          </span>
          <span className="text-sm font-semibold text-foreground">{label}</span>
        </div>
      ))}
    </div>
  );
}
