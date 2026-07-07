"use client";

import { motion } from "motion/react";
import { FileText, Download } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import type { LegalDocument } from "@/lib/gallery";

const BADGE_CLASSES = [
  "bg-palette-blue/10 text-palette-blue",
  "bg-palette-emerald/10 text-palette-emerald",
  "bg-palette-violet/10 text-palette-violet",
  "bg-palette-amber/10 text-palette-amber",
];

// The document card grid, shared by the homepage teaser (first few docs) and
// the full /legal-documents page — one source of truth for the card markup.
export default function LegalDocumentsGrid({
  documents,
}: {
  documents: LegalDocument[];
}) {
  return (
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
          transition={{ duration: 0.4, delay: (i % 4) * 0.1 }}
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
  );
}
