import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getGalleryCategories } from "@/lib/gallery";
import { BrandLogo } from "@/components/brand-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import GalleryClient from "@/components/gallery/gallery-client";

export const metadata: Metadata = { title: "Gallery" };

export default async function GalleryPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string }>;
}) {
  const { cat } = await searchParams;
  const categories = getGalleryCategories();

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
              href="/#gallery"
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <ArrowLeft className="size-4" />
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 px-6 py-12">
        <div className="mx-auto flex max-w-6xl flex-col gap-8">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
              Gallery
            </span>
            <h1 className="font-heading text-3xl font-bold tracking-tight">
              Photo &amp; Video Gallery
            </h1>
            <p className="max-w-2xl text-muted-foreground">
              Browse pictures and videos from the society&apos;s development
              and events, organized by category.
            </p>
          </div>
          <GalleryClient categories={categories} initialSlug={cat} />
        </div>
      </main>
    </div>
  );
}
