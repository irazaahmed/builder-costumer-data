import { branding } from "@/lib/branding";
import { cn } from "@/lib/utils";

// Rooftop-house mark + wordmark, both driven from lib/branding.ts so the
// brand stays centralized. The mark uses theme CSS vars (--brand*, --gold)
// instead of hardcoded hex, so it adapts to light/dark automatically.
// `variant="onBrand"` is for placing the logo on an emerald/dark surface.

// Wordmark splits the full site name into a primary line (shortName) and the
// remainder ("Housing Society"), without hardcoding either string here.
const primaryLine = branding.shortName;
const secondaryLine = branding.siteName.replace(branding.shortName, "").trim();

export function BrandLogo({
  size = 36,
  showText = true,
  variant = "default",
  className,
}: {
  size?: number;
  showText?: boolean;
  variant?: "default" | "onBrand";
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        aria-hidden
        className="shrink-0 drop-shadow-sm"
      >
        <defs>
          <linearGradient id="lb-badge" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="var(--brand-strong)" />
            <stop offset="1" stopColor="var(--brand)" />
          </linearGradient>
        </defs>
        <rect x="2" y="2" width="44" height="44" rx="13" fill="url(#lb-badge)" />
        {/* roof */}
        <path d="M24 10.5 L38 22 H10 Z" fill="var(--gold)" />
        {/* walls */}
        <rect x="15" y="22" width="18" height="15.5" rx="1.6" fill="#ffffff" />
        {/* door */}
        <rect x="21.4" y="28.5" width="5.2" height="9" rx="1" fill="var(--brand)" />
        {/* windows */}
        <rect x="16.6" y="24.4" width="3.6" height="3.6" rx="0.7" fill="var(--gold)" />
        <rect x="27.8" y="24.4" width="3.6" height="3.6" rx="0.7" fill="var(--gold)" />
      </svg>
      {showText && (
        <span className="flex flex-col leading-none">
          <span
            className={cn(
              "text-[0.95rem] font-bold tracking-tight",
              variant === "onBrand" ? "text-white" : "text-foreground"
            )}
          >
            {primaryLine}
          </span>
          {secondaryLine && (
            <span
              className={cn(
                "text-[0.62rem] font-semibold uppercase tracking-[0.18em]",
                variant === "onBrand" ? "text-gold-light" : "text-gold"
              )}
            >
              {secondaryLine}
            </span>
          )}
        </span>
      )}
    </span>
  );
}
