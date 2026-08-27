import logo from "@/assets/khoranex-logo.png.asset.json";

export function Logo({
  className = "",
  variant = "default",
}: {
  className?: string;
  variant?: "default" | "light";
}) {
  return (
    <span className={`flex items-center gap-2 ${className}`}>
      <img
        src={logo.url}
        alt="Khoranex logo"
        width={36}
        height={36}
        className="h-9 w-9 shrink-0 object-contain"
      />
      <span
        className={`text-xl font-extrabold tracking-tight ${
          variant === "light" ? "text-primary-foreground" : "text-foreground"
        }`}
      >
        Khoranex
      </span>
    </span>
  );
}
