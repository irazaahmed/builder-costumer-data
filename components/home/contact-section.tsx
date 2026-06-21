"use client";

import { motion } from "motion/react";
import { Mail, Phone } from "lucide-react";
import { branding } from "@/lib/branding";

export default function ContactSection() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5 }}
      className="border-t border-border/60 bg-secondary/30 px-6 py-20"
    >
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-3 text-center">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
          Get In Touch
        </span>
        <h2 className="font-heading text-3xl font-bold tracking-tight">Contact</h2>
        <p className="max-w-xl text-muted-foreground">
          Have a question about your account or documents? Reach out to us
          directly.
        </p>
        <div className="mt-4 grid w-full gap-4 sm:grid-cols-2">
          <a
            href={`mailto:${branding.contact.email}`}
            className="group flex items-center gap-3 rounded-xl border bg-card p-4 text-left ring-1 ring-foreground/10 transition-all hover:-translate-y-0.5 hover:ring-gold/40"
          >
            <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Mail className="size-5" />
            </span>
            <span className="flex flex-col">
              <span className="text-xs text-muted-foreground">Email</span>
              <span className="text-sm font-medium">{branding.contact.email}</span>
            </span>
          </a>
          <a
            href={`tel:${branding.contact.phone}`}
            className="group flex items-center gap-3 rounded-xl border bg-card p-4 text-left ring-1 ring-foreground/10 transition-all hover:-translate-y-0.5 hover:ring-gold/40"
          >
            <span className="flex size-11 items-center justify-center rounded-xl bg-gold/15 text-gold">
              <Phone className="size-5" />
            </span>
            <span className="flex flex-col">
              <span className="text-xs text-muted-foreground">Phone</span>
              <span className="text-sm font-medium">{branding.contact.phone}</span>
            </span>
          </a>
        </div>
      </div>
    </motion.section>
  );
}
