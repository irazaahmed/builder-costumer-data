"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  buildGalleryKey,
  getGalleryUploadUrl,
  deleteGalleryFile,
} from "@/lib/storage";

export interface GalleryActionState {
  error?: string;
  success?: boolean;
}

const ALLOWED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;
const ALLOWED_VIDEO_MIME_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
] as const;

const MAX_IMAGE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB
const MAX_VIDEO_SIZE_BYTES = 200 * 1024 * 1024; // 200 MB

type GalleryMimeClass = { kind: "IMAGE" | "VIDEO"; resourceType: "image" | "video" };

// Mirrors validateMimeAndSize in lib/actions/documents.ts / notifications.ts,
// but branches on image vs video since the two have different size caps and
// map to a different Cloudinary resource_type + GalleryItemType.
function validateGalleryMimeAndSize(
  mimeType: string,
  fileSize: number
): { error: string } | { data: GalleryMimeClass } {
  if (fileSize <= 0) {
    return { error: "File size must be greater than 0." };
  }

  if (ALLOWED_IMAGE_MIME_TYPES.includes(mimeType as (typeof ALLOWED_IMAGE_MIME_TYPES)[number])) {
    if (fileSize > MAX_IMAGE_SIZE_BYTES) {
      return { error: "Images must be at most 25 MB." };
    }
    return { data: { kind: "IMAGE", resourceType: "image" } };
  }

  if (ALLOWED_VIDEO_MIME_TYPES.includes(mimeType as (typeof ALLOWED_VIDEO_MIME_TYPES)[number])) {
    if (fileSize > MAX_VIDEO_SIZE_BYTES) {
      return { error: "Videos must be at most 200 MB." };
    }
    return { data: { kind: "VIDEO", resourceType: "video" } };
  }

  return { error: "Only JPEG, PNG, WEBP, GIF images or MP4, WEBM, MOV videos are allowed." };
}

function slugify(title: string): string {
  return (
    title
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "folder"
  );
}

async function uniqueFolderSlug(title: string): Promise<string> {
  const base = slugify(title);
  let slug = base;
  let suffix = 2;
  while (await prisma.galleryFolder.findUnique({ where: { slug } })) {
    slug = `${base}-${suffix}`;
    suffix += 1;
  }
  return slug;
}

function revalidateGallery(folderId?: string) {
  revalidatePath("/admin/gallery");
  if (folderId) revalidatePath(`/admin/gallery/${folderId}`);
  revalidatePath("/");
  revalidatePath("/gallery");
}

const createFolderSchema = z.object({
  title: z.string().trim().min(2, "Title must be at least 2 characters."),
  description: z.string().trim().max(500).optional(),
});

/** Admin-only. Creates an empty gallery folder with a unique, derived slug. */
export async function createGalleryFolderAction(input: {
  title: string;
  description?: string;
}): Promise<GalleryActionState & { folderId?: string }> {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Not authorized." };
  }

  const parsed = createFolderSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { title, description } = parsed.data;

  try {
    const slug = await uniqueFolderSlug(title);
    const folderCount = await prisma.galleryFolder.count();

    const folder = await prisma.galleryFolder.create({
      data: {
        slug,
        title,
        description,
        sortIndex: folderCount,
        createdBy: session.user.id,
      },
    });

    revalidateGallery();
    return { success: true, folderId: folder.id };
  } catch {
    return { error: "Failed to create folder. Please try again." };
  }
}

const folderIdSchema = z.string().min(1);

/**
 * Admin-only. Deletes every item's Cloudinary asset first, then the folder
 * row (which cascades its GalleryItem rows in the DB). Cloudinary cleanup
 * can't cascade, so it must happen explicitly and before the DB delete.
 */
export async function deleteGalleryFolderAction(
  folderId: string
): Promise<GalleryActionState> {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Not authorized." };
  }

  const parsed = folderIdSchema.safeParse(folderId);
  if (!parsed.success) {
    return { error: "Invalid folder id." };
  }

  try {
    const folder = await prisma.galleryFolder.findUnique({
      where: { id: parsed.data },
      include: { items: true },
    });
    if (!folder) {
      return { error: "Folder not found." };
    }

    await Promise.all(
      folder.items.map((item) =>
        deleteGalleryFile(item.fileKey, item.type === "VIDEO" ? "video" : "image").catch(
          () => {}
        )
      )
    );

    await prisma.galleryFolder.delete({ where: { id: folder.id } });

    revalidateGallery();
    return { success: true };
  } catch {
    return { error: "Failed to delete folder. Please try again." };
  }
}

const requestUploadSchema = z.object({
  folderId: z.string().min(1),
  fileName: z.string().min(1),
  fileSize: z.coerce.number().int().positive(),
  mimeType: z.string().min(1),
});

export interface RequestGalleryUploadResult extends GalleryActionState {
  url?: string;
  fields?: Record<string, string>;
  key?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  folderId?: string;
  type?: "IMAGE" | "VIDEO";
}

/**
 * Step 1 of the upload flow. Admin-only. Mirrors requestUploadAction in
 * lib/actions/documents.ts. Validates the target folder and the file's mime
 * type/size, then returns signed upload params for the browser to POST
 * directly to Cloudinary. Does NOT create a GalleryItem row yet.
 */
export async function requestGalleryUploadAction(
  input: {
    folderId: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
  }
): Promise<RequestGalleryUploadResult> {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Not authorized." };
  }

  const parsed = requestUploadSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { folderId, fileName, fileSize, mimeType } = parsed.data;

  const mimeCheck = validateGalleryMimeAndSize(mimeType, fileSize);
  if ("error" in mimeCheck) {
    return { error: mimeCheck.error };
  }

  try {
    const folder = await prisma.galleryFolder.findUnique({ where: { id: folderId } });
    if (!folder) {
      return { error: "Folder not found." };
    }

    const key = buildGalleryKey(folder.slug, fileName);
    const { url, fields } = await getGalleryUploadUrl({
      key,
      resourceType: mimeCheck.data.resourceType,
    });

    return {
      success: true,
      url,
      fields,
      key,
      fileName,
      fileSize,
      mimeType,
      folderId,
      type: mimeCheck.data.kind,
    };
  } catch {
    return { error: "Failed to prepare upload. Please try again." };
  }
}

const saveItemSchema = requestUploadSchema.extend({
  fileKey: z.string().min(1),
  format: z.string().min(1),
});

/**
 * Step 2 of the upload flow. Admin-only. Called after the browser has
 * successfully POSTed the file directly to Cloudinary. Re-validates
 * everything (defense in depth) and sanity-checks the fileKey before
 * persisting the GalleryItem row.
 */
export async function saveGalleryItemAction(input: {
  folderId: string;
  fileKey: string;
  format: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}): Promise<GalleryActionState> {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Not authorized." };
  }

  const parsed = saveItemSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { folderId, fileKey, format, fileName, fileSize, mimeType } = parsed.data;

  const mimeCheck = validateGalleryMimeAndSize(mimeType, fileSize);
  if ("error" in mimeCheck) {
    return { error: mimeCheck.error };
  }

  try {
    const folder = await prisma.galleryFolder.findUnique({ where: { id: folderId } });
    if (!folder) {
      return { error: "Folder not found." };
    }

    if (!fileKey.startsWith(`gallery/${folder.slug}/`)) {
      return { error: "File key does not match the target folder." };
    }

    const itemCount = await prisma.galleryItem.count({ where: { folderId } });

    await prisma.galleryItem.create({
      data: {
        folderId,
        type: mimeCheck.data.kind,
        fileKey,
        format,
        fileName,
        fileSize,
        mimeType,
        sortIndex: itemCount,
        uploadedBy: session.user.id,
      },
    });
  } catch {
    // The file already landed in Cloudinary (the browser's POST succeeded
    // before this action was called) — without this, a failed DB write
    // would orphan it.
    await deleteGalleryFile(
      fileKey,
      mimeCheck.data.resourceType
    ).catch(() => {});
    return { error: "Failed to save item. Please try again." };
  }

  revalidateGallery(folderId);
  return { success: true };
}

const itemIdSchema = z.string().min(1);

/**
 * Admin-only. Deletes the GalleryItem row first, then the underlying
 * Cloudinary object — if the object delete fails afterward, the worst case
 * is a harmless orphaned Cloudinary object, never a DB row pointing at
 * nothing.
 */
export async function deleteGalleryItemAction(
  itemId: string
): Promise<GalleryActionState> {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Not authorized." };
  }

  const parsed = itemIdSchema.safeParse(itemId);
  if (!parsed.success) {
    return { error: "Invalid item id." };
  }

  try {
    const item = await prisma.galleryItem.findUnique({ where: { id: parsed.data } });
    if (!item) {
      return { error: "Item not found." };
    }

    await prisma.galleryItem.delete({ where: { id: item.id } });
    await deleteGalleryFile(item.fileKey, item.type === "VIDEO" ? "video" : "image");

    revalidateGallery(item.folderId);
    return { success: true };
  } catch {
    return { error: "Failed to delete item. Please try again." };
  }
}
