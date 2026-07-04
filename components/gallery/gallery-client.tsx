"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, PlayCircle } from "lucide-react";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { GalleryCategoryWithItems } from "@/lib/gallery";

export default function GalleryClient({
  categories,
  initialSlug,
}: {
  categories: GalleryCategoryWithItems[];
  initialSlug?: string;
}) {
  const defaultSlug =
    (initialSlug && categories.some((c) => c.slug === initialSlug)
      ? initialSlug
      : categories[0]?.slug) ?? "";

  const [activeSlug, setActiveSlug] = useState(defaultSlug);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const activeCategory = categories.find((c) => c.slug === activeSlug);
  const items = activeCategory?.items ?? [];
  const activeItem = lightboxIndex !== null ? items[lightboxIndex] : null;

  function closeLightbox() {
    setLightboxIndex(null);
  }

  function showNext() {
    setLightboxIndex((prev) =>
      prev === null || items.length === 0 ? null : (prev + 1) % items.length,
    );
  }

  function showPrev() {
    setLightboxIndex((prev) =>
      prev === null || items.length === 0
        ? null
        : (prev - 1 + items.length) % items.length,
    );
  }

  if (categories.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No gallery items are available yet.
      </p>
    );
  }

  return (
    <>
      <Tabs
        value={activeSlug}
        onValueChange={(value) => setActiveSlug(value as string)}
      >
        <TabsList className="h-auto flex-wrap justify-start gap-1.5 bg-transparent p-0">
          {categories.map((category) => (
            <TabsTrigger
              key={category.slug}
              value={category.slug}
              className="rounded-full border border-border/60 bg-muted px-3 py-1.5 text-xs data-active:border-primary data-active:bg-primary data-active:text-primary-foreground"
            >
              {category.title}
              <span className="ml-1.5 opacity-70">
                {category.items.length}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map((category) => (
          <TabsContent
            key={category.slug}
            value={category.slug}
            className="mt-6"
          >
            <p className="mb-4 text-sm text-muted-foreground">
              {category.description}
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {category.items.map((item, index) => (
                <button
                  key={item.src}
                  type="button"
                  onClick={() => setLightboxIndex(index)}
                  className="group relative aspect-square overflow-hidden rounded-xl ring-1 ring-foreground/10 transition-shadow hover:shadow-lg"
                >
                  {item.type === "video" ? (
                    <>
                      <video
                        src={item.src}
                        className="size-full object-cover"
                        muted
                        preload="metadata"
                        playsInline
                      />
                      <div className="absolute inset-0 bg-black/20" />
                      <PlayCircle className="absolute inset-0 m-auto size-8 text-white drop-shadow" />
                    </>
                  ) : (
                    <Image
                      src={item.src}
                      alt={category.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                    />
                  )}
                </button>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <Dialog
        open={lightboxIndex !== null}
        onOpenChange={(open) => !open && closeLightbox()}
      >
        <DialogContent
          className="max-w-[calc(100%-2rem)] border-none bg-black p-0 sm:max-w-4xl"
        >
          <DialogTitle className="sr-only">
            {activeCategory?.title ?? "Gallery"}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Viewing media from {activeCategory?.title ?? "the gallery"}
          </DialogDescription>
          {activeItem && (
            <div className="relative flex h-[70vh] w-full items-center justify-center">
              {activeItem.type === "video" ? (
                <video
                  src={activeItem.src}
                  controls
                  autoPlay
                  className="max-h-full max-w-full rounded-lg"
                />
              ) : (
                <Image
                  src={activeItem.src}
                  alt={activeCategory?.title ?? ""}
                  fill
                  className="object-contain"
                  sizes="90vw"
                />
              )}
              {items.length > 1 && (
                <>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={showPrev}
                    className="absolute left-2 top-1/2 -translate-y-1/2 text-white hover:bg-white/10 hover:text-white"
                  >
                    <ChevronLeft className="size-6" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={showNext}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-white hover:bg-white/10 hover:text-white"
                  >
                    <ChevronRight className="size-6" />
                  </Button>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
