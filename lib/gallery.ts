// Photo/video categories are admin-managed (see /admin/gallery and
// lib/actions/gallery.ts) and read here from the GalleryFolder/GalleryItem
// tables. Society legal documents are still read straight off
// public/gallery/legal-documents/ at request time — that part is unchanged.
import fs from "node:fs";
import path from "node:path";
import { formatFileSize } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { getGallerySecureUrl } from "@/lib/storage";

export type GalleryCategory = {
  slug: string;
  title: string;
  description: string;
};

export type GalleryItem = {
  src: string;
  type: "image" | "video";
  fileName: string;
};

export type GalleryCategoryWithItems = GalleryCategory & { items: GalleryItem[] };

const GALLERY_ROOT = path.join(process.cwd(), "public", "gallery");

// Only returns folders that actually have items, so an empty folder never
// shows up as a broken tab.
export async function getGalleryCategories(): Promise<GalleryCategoryWithItems[]> {
  const folders = await prisma.galleryFolder.findMany({
    include: { items: { orderBy: { sortIndex: "asc" } } },
    orderBy: { sortIndex: "asc" },
  });

  return folders
    .filter((folder) => folder.items.length > 0)
    .map((folder) => ({
      slug: folder.slug,
      title: folder.title,
      description: folder.description ?? "",
      items: folder.items.map((item) => ({
        fileName: item.fileName,
        type: item.type === "VIDEO" ? "video" : "image",
        src: getGallerySecureUrl(
          item.fileKey,
          item.type === "VIDEO" ? "video" : "image",
          item.format
        ),
      })),
    }));
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
