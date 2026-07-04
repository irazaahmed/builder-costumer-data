"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { Camera, PlayCircle } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import type { GalleryCategoryWithItems } from "@/lib/gallery";

export default function GallerySection({
  categories,
}: {
  categories: GalleryCategoryWithItems[];
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5 }}
      className="border-t border-border/60 bg-secondary/30 px-6 py-20"
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-10">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
            Gallery
          </span>
          <h2 className="font-heading text-3xl font-bold tracking-tight">
            Moments from the <span className="text-primary">Society</span>
          </h2>
          <p className="max-w-xl text-muted-foreground">
            A look at the society&apos;s development, events, and community life
            over the years.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category, i) => {
            const cover = category.items[0];
            return (
              <motion.div
                key={category.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                whileHover={{ y: -4 }}
              >
                <Link
                  href={`/gallery?cat=${category.slug}`}
                  className="group relative flex aspect-[4/3] w-full overflow-hidden rounded-2xl shadow-sm ring-1 ring-foreground/10 transition-shadow hover:shadow-lg"
                >
                  {cover?.type === "video" ? (
                    <video
                      src={cover.src}
                      className="size-full object-cover"
                      muted
                      preload="metadata"
                      playsInline
                    />
                  ) : cover ? (
                    <Image
                      src={cover.src}
                      alt={category.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    />
                  ) : null}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  {cover?.type === "video" && (
                    <PlayCircle className="absolute inset-0 m-auto size-10 text-white/90 drop-shadow" />
                  )}
                  <div className="relative mt-auto flex w-full items-end justify-between gap-2 p-4">
                    <h3 className="text-sm font-semibold text-white drop-shadow">
                      {category.title}
                    </h3>
                    <span className="flex shrink-0 items-center gap-1 rounded-full bg-black/40 px-2 py-0.5 text-xs font-medium text-white">
                      <Camera className="size-3" />
                      {category.items.length}
                    </span>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        <Link
          href="/gallery"
          className={buttonVariants({ variant: "gold", className: "mx-auto" })}
        >
          View Full Gallery
        </Link>
      </div>
    </motion.section>
  );
}
