"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { FileText, Download } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { branding } from "@/lib/branding";
import type { LegalDocument } from "@/lib/gallery";

const BADGE_CLASSES = [
  "bg-palette-blue/10 text-palette-blue",
  "bg-palette-emerald/10 text-palette-emerald",
  "bg-palette-violet/10 text-palette-violet",
  "bg-palette-amber/10 text-palette-amber",
];

export default function LegalDocumentsSection({
  documents,
}: {
  documents: LegalDocument[];
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5 }}
      className="px-6 py-20"
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-10">
        <div className="flex flex-col items-center gap-3 text-center">
          {/* emerald seal for light theme, gold for dark — a fixed-colour PNG
              can't adapt, so swap the source by theme */}
          <Image
            src={branding.seal}
            alt={`Official registration seal of ${branding.siteName}`}
            width={104}
            height={104}
            className="h-24 w-auto opacity-90 dark:hidden"
          />
          <Image
            src={branding.sealLight}
            alt=""
            aria-hidden
            width={104}
            height={104}
            className="hidden h-24 w-auto opacity-90 dark:block"
          />
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
            Legal Documents
          </span>
          <h2 className="font-heading text-3xl font-bold tracking-tight">
            Society <span className="text-primary">Documents</span>
          </h2>
          <p className="max-w-xl text-muted-foreground">
            Official by-laws, registration, and map documents of the society —
            open to view or download by anyone.
          </p>
          <span className="mt-1 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-1.5 text-xs font-medium text-gold">
            Registered Cooperative Society &middot; Reg. No. {branding.registrationNo}
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {documents.map((doc, i) => (
            <motion.a
              key={doc.fileName}
              href={doc.href}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              whileHover={{ y: -4 }}
            >
              <Card className="h-full transition-all hover:-translate-y-1 hover:shadow-lg hover:ring-gold/30">
                <CardHeader>
                  <div
                    className={`mb-2 flex size-11 items-center justify-center rounded-xl ${BADGE_CLASSES[i % BADGE_CLASSES.length]}`}
                  >
                    <FileText className="size-5" />
                  </div>
                  <CardTitle className="flex items-start justify-between gap-2 text-base">
                    {doc.title}
                    <Download className="size-4 shrink-0 text-muted-foreground" />
                  </CardTitle>
                  <CardDescription>PDF &middot; {doc.sizeLabel}</CardDescription>
                </CardHeader>
              </Card>
            </motion.a>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
