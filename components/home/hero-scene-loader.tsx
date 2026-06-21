"use client";

import dynamic from "next/dynamic";

// next/dynamic with ssr:false is only legal inside a Client Component, so this
// loader exists purely to host that call — app/page.tsx (a Server Component)
// imports this file instead of hero-scene.tsx directly.
const HeroScene = dynamic(() => import("./hero-scene"), {
  ssr: false,
  loading: () => (
    <div className="size-full animate-pulse rounded-3xl bg-gradient-to-br from-primary/20 via-muted to-brand-accent/10" />
  ),
});

export default function HeroSceneLoader() {
  return <HeroScene />;
}
