"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

// Floating "back to top" button — appears once the page is scrolled down a bit
// and smooth-scrolls to the top. Rendered site-wide from the root layout.
export function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      type="button"
      aria-label="Scroll to top"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={cn(
        "fixed bottom-5 right-5 z-50 flex size-11 items-center justify-center rounded-full bg-brand-gradient text-primary-foreground shadow-lg ring-1 ring-gold/40 transition-all hover:-translate-y-0.5 hover:brightness-110",
        visible
          ? "opacity-100"
          : "pointer-events-none translate-y-2 opacity-0"
      )}
    >
      <ArrowUp className="size-5" />
    </button>
  );
}
