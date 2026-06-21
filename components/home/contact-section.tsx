"use client";

import { motion } from "motion/react";
import { branding } from "@/lib/branding";

export default function ContactSection() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5 }}
      className="px-6 py-16"
    >
      <div className="mx-auto flex max-w-3xl flex-col gap-4 text-center">
        <h2 className="text-2xl font-semibold tracking-tight">Contact</h2>
        <p className="text-muted-foreground">
          Have a question about your account or documents? Reach out to us
          directly.
        </p>
        <div className="flex flex-col gap-1 text-sm">
          <span>
            Email:{" "}
            <a href={`mailto:${branding.contact.email}`} className="text-primary underline">
              {branding.contact.email}
            </a>
          </span>
          <span>
            Phone:{" "}
            <a href={`tel:${branding.contact.phone}`} className="text-primary underline">
              {branding.contact.phone}
            </a>
          </span>
        </div>
      </div>
    </motion.section>
  );
}
