import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// Consistent page header for admin/client panel pages: an emerald icon chip,
// a heading, an optional description, and an optional right-aligned action.
const CHIP_CLASS = {
  primary: "bg-primary/10 text-primary",
  gold: "bg-gold/15 text-gold",
  blue: "bg-palette-blue/10 text-palette-blue",
  amber: "bg-palette-amber/10 text-palette-amber",
  violet: "bg-palette-violet/10 text-palette-violet",
} as const;

export function PageHeader({
  icon: Icon,
  title,
  description,
  action,
  color = "primary",
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  color?: keyof typeof CHIP_CLASS;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-xl",
            CHIP_CLASS[color]
          )}
        >
          <Icon className="size-6" />
        </span>
        <div className="flex flex-col gap-0.5">
          <h1 className="font-heading text-2xl font-bold tracking-tight">{title}</h1>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
