import { cn } from "@/lib/utils";
import type { DocumentCategory } from "@/lib/generated/prisma/client";

// Tailwind needs the full class string literally present to generate it —
// can't interpolate `bg-palette-${key}` here, so every combination is
// spelled out even though it's mechanically derived from categoryPaletteKey.
const CATEGORY_CLASS: Record<DocumentCategory, string> = {
  LEGAL: "bg-palette-blue/10 text-palette-blue border-palette-blue/25",
  PAYMENT: "bg-palette-emerald/10 text-palette-emerald border-palette-emerald/25",
  ALLOTMENT: "bg-palette-violet/10 text-palette-violet border-palette-violet/25",
  CNIC: "bg-palette-amber/10 text-palette-amber border-palette-amber/25",
  OTHER: "bg-palette-slate/10 text-palette-slate border-palette-slate/25",
};

export function CategoryBadge({ category }: { category: DocumentCategory }) {
  return (
    <span
      className={cn(
        "inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        CATEGORY_CLASS[category]
      )}
    >
      {category}
    </span>
  );
}
