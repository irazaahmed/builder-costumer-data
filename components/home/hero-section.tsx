"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { ShieldCheck, MapPin } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { branding } from "@/lib/branding";
import HeroSceneLoader from "./hero-scene-loader";

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay },
});

export default function HeroSection() {
  return (
    <section className="relative isolate flex flex-col items-center gap-8 overflow-hidden px-6 py-28 text-center">
      {/* layered emerald wash + gold radial glow */}
      <div
        aria-hidden
        className="absolute inset-0 -z-20 bg-gradient-to-b from-primary/10 via-background to-background"
      />
      <div
        aria-hidden
        className="absolute -top-40 left-1/2 -z-20 size-[640px] -translate-x-1/2 rounded-full bg-gold/10 blur-3xl"
      />

      {/* 3D plot-grid backdrop — shown on every screen size (it used to be
          md-and-up only, so mobile got a blank hero). Size scales down on
          small screens so it stays a subtle backdrop, not an overflow. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 mx-auto flex max-w-5xl items-center justify-center opacity-30"
      >
        <div className="size-[300px] sm:size-[440px] md:size-[560px]">
          <HeroSceneLoader />
        </div>
      </div>

      <motion.span
        {...fadeUp(0)}
        className="z-10 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-gold"
      >
        <MapPin className="size-3.5" />
        Surjani Sector 12, Karachi · 17 Acres
      </motion.span>

      <div className="relative z-10 flex max-w-3xl flex-col items-center gap-5 rounded-3xl bg-background/70 px-6 py-8 backdrop-blur-sm">
        {/* official registration seal — inside the name card, above the name.
            Emerald in light theme, gold in dark (a fixed-colour PNG can't adapt) */}
        <motion.div {...fadeUp(0.1)}>
          <Image
            src={branding.seal}
            alt={`Official registration seal of ${branding.siteName}`}
            width={520}
            height={520}
            priority
            className="h-24 w-auto sm:h-28 dark:hidden"
          />
          <Image
            src={branding.sealLight}
            alt={`Official registration seal of ${branding.siteName}`}
            width={520}
            height={520}
            priority
            className="hidden h-24 w-auto sm:h-28 dark:block"
          />
        </motion.div>
        <motion.h1
          {...fadeUp(0.15)}
          className="font-heading text-4xl font-bold tracking-tight sm:text-6xl"
        >
          {branding.shortName}
          <span className="mt-1 block whitespace-nowrap text-gold-gradient leading-tight text-[clamp(1.05rem,4.6vw,2.5rem)]">
            {branding.siteName.replace(branding.shortName, "").trim()}
          </span>
        </motion.h1>
      </div>

      <motion.div
        {...fadeUp(0.25)}
        className="relative z-10 flex flex-col gap-3 sm:flex-row"
      >
        <motion.span whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
          <Link href="/login" className={buttonVariants({ size: "lg", variant: "gold" })}>
            <ShieldCheck />
            Client Login
          </Link>
        </motion.span>
        <motion.span whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
          <Link
            href="/signup"
            className={buttonVariants({ size: "lg", variant: "outline" })}
          >
            Sign Up
          </Link>
        </motion.span>
      </motion.div>
    </section>
  );
}
