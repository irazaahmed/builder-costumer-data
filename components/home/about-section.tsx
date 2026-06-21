"use client";

import Image from "next/image";
import { motion } from "motion/react";

export default function AboutSection() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5 }}
      className="border-t bg-muted/30 px-6 py-16"
    >
      <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-2 md:items-center">
        <div className="flex flex-col gap-4">
          <h2 className="text-2xl font-semibold tracking-tight">About the Project</h2>
          <p className="text-muted-foreground">
            Spanning 17 acres in Surjani Sector 12, Karachi, this is a fully
            developed residential plot scheme made up of 360 plots, all of which
            have already been sold to their respective owners.
          </p>
          <p className="text-muted-foreground">
            With every plot allotted, our focus has shifted to giving each owner a
            simple, secure way to access the paperwork tied to their property —
            allotment letters, sale agreements, payment records, and identification
            documents — without relying on physical copies or in-person visits.
          </p>
          <p className="text-muted-foreground">
            This portal was built specifically for that purpose: a private,
            read-only record of each client&apos;s documents, available whenever
            they need it.
          </p>
        </div>
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl shadow-lg ring-1 ring-foreground/10">
          <Image
            src="https://images.unsplash.com/photo-1524813686514-a57563d77965?auto=format&fit=crop&w=1200&q=80"
            alt="Aerial view of a residential plot development with organized streets and lots"
            fill
            className="object-cover"
            sizes="(min-width: 768px) 50vw, 100vw"
          />
        </div>
      </div>
    </motion.section>
  );
}
