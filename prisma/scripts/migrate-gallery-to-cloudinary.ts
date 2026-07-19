// One-time backfill: uploads the existing public/gallery/{slug}/* files to
// Cloudinary and inserts matching GalleryFolder/GalleryItem rows, so the
// live site keeps showing today's content immediately after cutover to the
// DB-backed gallery (see lib/gallery.ts). Not part of prisma/seed.ts —
// seeding stays structural-only per CLAUDE.md; this is one-time tooling.
//
// Run with: npx tsx prisma/scripts/migrate-gallery-to-cloudinary.ts
//
// Safe to re-run: skips any folder slug that already exists in the DB, so a
// partial/interrupted run can just be re-run to pick up where it left off.
import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { prisma } from "../../lib/prisma";
import { buildGalleryKey, uploadGalleryFileFromDisk } from "../../lib/storage";

const GALLERY_ROOT = path.join(process.cwd(), "public", "gallery");
const VIDEO_EXTENSIONS = new Set([".mp4", ".webm", ".mov"]);
const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);

const MIME_BY_EXT: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
};

// Same 9 categories/titles/descriptions that used to live in
// GALLERY_CATEGORIES in lib/gallery.ts before it moved to the DB. Order here
// becomes each folder's sortIndex.
const GALLERY_CATEGORIES = [
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

async function main() {
  const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  if (!admin) {
    throw new Error("No ADMIN user found — seed the admin account first.");
  }

  for (const [index, category] of GALLERY_CATEGORIES.entries()) {
    const existing = await prisma.galleryFolder.findUnique({
      where: { slug: category.slug },
    });
    if (existing) {
      console.log(`skip (already migrated): ${category.slug}`);
      continue;
    }

    const dir = path.join(GALLERY_ROOT, category.slug);
    let fileNames: string[] = [];
    try {
      fileNames = fs.readdirSync(dir).filter((fileName) => {
        const ext = path.extname(fileName).toLowerCase();
        return VIDEO_EXTENSIONS.has(ext) || IMAGE_EXTENSIONS.has(ext);
      });
    } catch {
      console.log(`skip (no local folder): ${category.slug}`);
      continue;
    }
    fileNames.sort();

    if (fileNames.length === 0) {
      console.log(`skip (empty): ${category.slug}`);
      continue;
    }

    console.log(`migrating ${category.slug} (${fileNames.length} files)...`);

    const folder = await prisma.galleryFolder.create({
      data: {
        slug: category.slug,
        title: category.title,
        description: category.description,
        sortIndex: index,
        createdBy: admin.id,
      },
    });

    for (const [itemIndex, fileName] of fileNames.entries()) {
      const ext = path.extname(fileName).toLowerCase();
      const isVideo = VIDEO_EXTENSIONS.has(ext);
      const resourceType = isVideo ? "video" : "image";
      const filePath = path.join(dir, fileName);
      const fileSize = fs.statSync(filePath).size;
      const key = buildGalleryKey(folder.slug, fileName);

      const { format } = await uploadGalleryFileFromDisk(filePath, key, resourceType);

      await prisma.galleryItem.create({
        data: {
          folderId: folder.id,
          type: isVideo ? "VIDEO" : "IMAGE",
          fileKey: key,
          format,
          fileName,
          fileSize,
          mimeType: MIME_BY_EXT[ext] ?? "application/octet-stream",
          sortIndex: itemIndex,
          uploadedBy: admin.id,
        },
      });

      console.log(`  uploaded ${fileName}`);
    }
  }

  console.log("done.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
