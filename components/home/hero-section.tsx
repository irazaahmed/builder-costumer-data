"use client";

import Link from "next/link";
import { motion } from "motion/react";
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
    <section className="relative flex flex-col items-center gap-8 overflow-hidden px-6 py-24 text-center">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 mx-auto hidden max-w-5xl items-center justify-center opacity-25 md:flex"
      >
        <div className="size-[560px]">
          <HeroSceneLoader />
        </div>
      </div>

      <div className="relative z-10 flex max-w-2xl flex-col gap-4 rounded-3xl bg-background/75 px-6 py-8 backdrop-blur-sm">
        <motion.h1
          {...fadeUp(0)}
          className="text-4xl font-semibold tracking-tight sm:text-5xl"
        >
          {branding.siteName}
        </motion.h1>
        <motion.p {...fadeUp(0.1)} className="text-lg text-muted-foreground">
          {branding.tagline}
        </motion.p>
        <motion.p {...fadeUp(0.2)} className="text-muted-foreground">
          A 17-acre residential plot project in Surjani Sector 12, Karachi, with
          360 fully sold plots. This portal gives every client secure, private
          access to their own ownership and legal documents.
        </motion.p>
      </div>

      <motion.div
        {...fadeUp(0.3)}
        className="relative z-10 flex flex-col gap-3 sm:flex-row"
      >
        <motion.span whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
          <Link href="/login" className={buttonVariants({ size: "lg" })}>
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
