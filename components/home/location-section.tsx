"use client";

import Image from "next/image";
import { motion } from "motion/react";

export default function LocationSection() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5 }}
      className="relative isolate flex min-h-[420px] items-center overflow-hidden border-t"
    >
      <Image
        src="https://images.unsplash.com/photo-1589927725301-dda06a332802?auto=format&fit=crop&w=1920&q=80"
        alt="Aerial view of a suburban plot development under a blue sky"
        fill
        className="object-cover"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/60 to-palette-violet/40" />
      <div className="relative mx-auto flex max-w-5xl flex-col gap-4 px-6 py-16 text-primary-foreground">
        <h2 className="text-2xl font-semibold tracking-tight">Location</h2>
        <p className="max-w-xl text-primary-foreground/90">
          The project is located in Surjani Sector 12, Karachi, occupying a
          17-acre site of fully allotted residential plots.
        </p>
      </div>
    </motion.section>
  );
}
