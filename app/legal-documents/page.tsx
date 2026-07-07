import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getLegalDocuments } from "@/lib/gallery";
import { branding } from "@/lib/branding";
import { BrandLogo } from "@/components/brand-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import LegalDocumentsGrid from "@/components/home/legal-documents-grid";

export const metadata: Metadata = {
  title: "Legal Documents",
  description:
    "Official by-laws, registration, financial, and map documents of the society.",
};

export default function LegalDocumentsPage() {
  const documents = getLegalDocuments();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-md supports-[backdrop-filter]:bg-background/70">
        <div className="h-0.5 w-full bg-gold-gradient" />
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
          <Link href="/">
            <BrandLogo size={36} />
          </Link>
          <div className="flex items-center gap-1.5">
            <ThemeToggle />
            <Link
              href="/#legal-documents"
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <ArrowLeft className="size-4" />
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 px-6 py-12">
        <div className="mx-auto flex max-w-5xl flex-col gap-8">
          <div className="flex flex-col items-center gap-3 text-center">
            {/* emerald seal for light theme, gold for dark — a fixed-colour
                PNG can't adapt, so swap the source by theme */}
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
            <h1 className="font-heading text-3xl font-bold tracking-tight">
              Society <span className="text-primary">Documents</span>
            </h1>
            <p className="max-w-xl text-muted-foreground">
              Official by-laws, registration, financial, and map documents of
              the society — open to view or download by anyone.
            </p>
            <span className="mt-1 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-1.5 text-xs font-medium text-gold">
              Registered Cooperative Society &middot; Reg. No.{" "}
              {branding.registrationNo}
            </span>
          </div>

          {documents.length === 0 ? (
            <p className="text-center text-muted-foreground">
              No documents available yet.
            </p>
          ) : (
            <LegalDocumentsGrid documents={documents} />
          )}
        </div>
      </main>
    </div>
  );
}
