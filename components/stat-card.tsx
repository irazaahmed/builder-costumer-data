import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// Colored stat tile for dashboards. Colors map to the brand + shared palette
// tokens (lib/branding.ts) — full class strings are spelled out because
// Tailwind can't generate interpolated class names.
type StatColor = "primary" | "gold" | "blue" | "amber" | "violet" | "rose";

const CHIP_CLASS: Record<StatColor, string> = {
  primary: "bg-primary/10 text-primary",
  gold: "bg-gold/15 text-gold",
  blue: "bg-palette-blue/10 text-palette-blue",
  amber: "bg-palette-amber/10 text-palette-amber",
  violet: "bg-palette-violet/10 text-palette-violet",
  rose: "bg-palette-rose/10 text-palette-rose",
};

const BAR_CLASS: Record<StatColor, string> = {
  primary: "bg-primary",
  gold: "bg-gold",
  blue: "bg-palette-blue",
  amber: "bg-palette-amber",
  violet: "bg-palette-violet",
  rose: "bg-palette-rose",
};

export function StatCard({
  label,
  value,
  icon: Icon,
  color = "primary",
  className,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color?: StatColor;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex items-center gap-4 overflow-hidden rounded-xl border bg-card p-5 ring-1 ring-foreground/10 transition-all hover:-translate-y-0.5 hover:shadow-md",
        className
      )}
    >
      <span className={cn("absolute inset-y-0 left-0 w-1", BAR_CLASS[color])} />
      <span
        className={cn(
          "flex size-12 shrink-0 items-center justify-center rounded-xl",
          CHIP_CLASS[color]
        )}
      >
        <Icon className="size-6" />
      </span>
      <div className="flex flex-col">
        <span className="font-heading text-2xl font-bold leading-none">{value}</span>
        <span className="mt-1 text-sm text-muted-foreground">{label}</span>
      </div>
    </div>
  );
}
