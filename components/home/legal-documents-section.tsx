"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { branding } from "@/lib/branding";
import type { LegalDocument } from "@/lib/gallery";
import LegalDocumentsGrid from "./legal-documents-grid";

export default function LegalDocumentsSection({
  documents,
  limit,
}: {
  documents: LegalDocument[];
  // When set, only the first `limit` documents show here and a "View all"
  // button links to the full /legal-documents page (homepage teaser use).
  limit?: number;
}) {
  const shown = limit != null ? documents.slice(0, limit) : documents;
  const hasMore = limit != null && documents.length > limit;

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

        <LegalDocumentsGrid documents={shown} />

        {hasMore && (
          <div className="flex justify-center">
            <Link
              href="/legal-documents"
              className={buttonVariants({ variant: "outline", size: "lg" })}
            >
              View all {documents.length} documents
              <ArrowRight className="size-4" />
            </Link>
          </div>
        )}
      </div>
    </motion.section>
  );
}
