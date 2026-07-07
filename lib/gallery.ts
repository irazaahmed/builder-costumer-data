// Reads photo/video categories and society legal documents straight off
// public/gallery/ at request time. Dropping new files into an existing
// category folder (or adding a folder + entry in GALLERY_CATEGORIES below)
// is the only thing needed to update the site — no other code changes.
import fs from "node:fs";
import path from "node:path";
import { formatFileSize } from "@/lib/format";

export type GalleryCategory = {
  slug: string;
  title: string;
  description: string;
};

// Order here is the display order everywhere (homepage teaser, /gallery tabs).
export const GALLERY_CATEGORIES: GalleryCategory[] = [
  {
    slug: "initial-development",
    title: "Initial Development",
    description: "Early groundwork and site development of the society.",
  },
  {
    slug: "park-construction",
    title: "Park Construction",
    description: "The community park taking shape.",
  },
  {
    slug: "latest-park-picture",
    title: "Latest Park Picture",
    description: "A recent look at the completed community park.",
  },
  {
    slug: "water-supply-work-progress",
    title: "Water Supply Work Progress",
    description: "Water supply infrastructure being laid across the society.",
  },
  {
    slug: "temporary-electricity-connection",
    title: "Temporary Electricity Connection",
    description: "Temporary power connection set up for the society.",
  },
  {
    slug: "masjid-construction",
    title: "Masjid Construction",
    description: "Construction of the society masjid, donated by Nawab Brothers.",
  },
  {
    slug: "election-pictures",
    title: "Election Pictures",
    description: "Moments from the society's election day.",
  },
  {
    slug: "last-election-oath-ceremony",
    title: "Last Election Oath Ceremony",
    description: "Oath ceremony of the newly elected committee.",
  },
  {
    slug: "tribute-abdul-waheed-lodhi",
    title: "Tribute to Ex-President Abdul Waheed Lodhi (late)",
    description: "Honoring the late Ex-President's services to the society.",
  },
];

export type GalleryItem = {
  src: string;
  type: "image" | "video";
  fileName: string;
};

export type GalleryCategoryWithItems = GalleryCategory & { items: GalleryItem[] };

const GALLERY_ROOT = path.join(process.cwd(), "public", "gallery");
const VIDEO_EXTENSIONS = new Set([".mp4", ".webm", ".mov"]);
const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);

function readCategoryItems(slug: string): GalleryItem[] {
  let files: string[] = [];
  try {
    files = fs.readdirSync(path.join(GALLERY_ROOT, slug));
  } catch {
    return [];
  }

  return files
    .filter((fileName) => {
      const ext = path.extname(fileName).toLowerCase();
      return VIDEO_EXTENSIONS.has(ext) || IMAGE_EXTENSIONS.has(ext);
    })
    .sort()
    .map((fileName) => {
      const ext = path.extname(fileName).toLowerCase();
      return {
        fileName,
        type: VIDEO_EXTENSIONS.has(ext) ? "video" : "image",
        src: `/gallery/${slug}/${encodeURIComponent(fileName)}`,
      };
    });
}

// Only returns categories that actually have files, so an empty/renamed
// folder never shows up as a broken tab.
export function getGalleryCategories(): GalleryCategoryWithItems[] {
  return GALLERY_CATEGORIES.map((category) => ({
    ...category,
    items: readCategoryItems(category.slug),
  })).filter((category) => category.items.length > 0);
}

export type LegalDocument = {
  title: string;
  fileName: string;
  href: string;
  sizeLabel: string;
};

// Explicit display order — the first entry shows first everywhere (homepage
// teaser and the /legal-documents page). Any PDF dropped into the folder that
// isn't listed here still appears, appended after these and sorted by name.
const LEGAL_DOCS: { fileName: string; title: string }[] = [
  { fileName: "Financial-Report-2025.pdf", title: "Financial Report 2025" },
  { fileName: "ByLaws Lodhi Brother Housing Society.pdf", title: "Society By-Laws" },
  { fileName: "Laws.pdf", title: "Society Laws" },
  { fileName: "Legal Document.pdf", title: "Legal Document" },
  { fileName: "Map.pdf", title: "Society Map" },
];

export function getLegalDocuments(): LegalDocument[] {
  const dir = path.join(GALLERY_ROOT, "legal-documents");
  let files: string[] = [];
  try {
    files = fs.readdirSync(dir);
  } catch {
    return [];
  }

  const orderIndex = new Map(LEGAL_DOCS.map((doc, i) => [doc.fileName, i]));
  const titleByFile = new Map(LEGAL_DOCS.map((doc) => [doc.fileName, doc.title]));
  const UNLISTED = Number.MAX_SAFE_INTEGER;

  return files
    .filter((fileName) => fileName.toLowerCase().endsWith(".pdf"))
    .sort((a, b) => {
      const ia = orderIndex.get(a) ?? UNLISTED;
      const ib = orderIndex.get(b) ?? UNLISTED;
      return ia !== ib ? ia - ib : a.localeCompare(b);
    })
    .map((fileName) => ({
      fileName,
      title: titleByFile.get(fileName) ?? fileName.replace(/\.pdf$/i, ""),
      href: `/gallery/legal-documents/${encodeURIComponent(fileName)}`,
      sizeLabel: formatFileSize(fs.statSync(path.join(dir, fileName)).size),
    }));
}
