"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { buildDocumentKey, getUploadUrl, deleteFile } from "@/lib/storage";

export interface DocumentActionState {
  error?: string;
  success?: boolean;
}

const ALLOWED_MIME_TYPES = ["application/pdf", "image/jpeg", "image/png"] as const;
const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB

const documentCategorySchema = z.enum([
  "LEGAL",
  "PAYMENT",
  "ALLOTMENT",
  "CNIC",
  "OTHER",
]);

// Shared by both the upload-request step and the create step so the
// server-side mime/size checks are enforced identically (and independently)
// in each — never assume the first action's validation still holds by the
// time the second one runs.
const documentInputSchema = z.object({
  clientId: z.string().min(1),
  title: z.string().trim().min(2, "Title must be at least 2 characters."),
  category: documentCategorySchema,
  fileName: z.string().min(1),
  fileSize: z.coerce.number().int().positive(),
  mimeType: z.string().min(1),
});

function validateMimeAndSize(
  mimeType: string,
  fileSize: number
): string | null {
  if (!ALLOWED_MIME_TYPES.includes(mimeType as (typeof ALLOWED_MIME_TYPES)[number])) {
    return "Only PDF, JPEG, or PNG files are allowed.";
  }
  if (fileSize <= 0 || fileSize > MAX_FILE_SIZE_BYTES) {
    return "File size must be greater than 0 and at most 25 MB.";
  }
  return null;
}

export interface RequestUploadResult extends DocumentActionState {
  url?: string;
  key?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  clientId?: string;
  title?: string;
  category?: z.infer<typeof documentCategorySchema>;
}

/**
 * Step 1 of the upload flow. Admin-only. Validates the requested upload,
 * confirms the target client exists, then returns a presigned PUT URL for
 * the browser to upload directly to R2. Does NOT create a Document row —
 * the file has not reached R2 yet at this point.
 */
export async function requestUploadAction(input: {
  clientId: string;
  title: string;
  category: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}): Promise<RequestUploadResult> {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Not authorized." };
  }

  const parsed = documentInputSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { clientId, title, category, fileName, fileSize, mimeType } =
    parsed.data;

  const mimeOrSizeError = validateMimeAndSize(mimeType, fileSize);
  if (mimeOrSizeError) {
    return { error: mimeOrSizeError };
  }

  try {
    const client = await prisma.client.findUnique({ where: { id: clientId } });
    if (!client) {
      return { error: "Client not found." };
    }

    const key = buildDocumentKey(clientId, category, fileName);
    const { url } = await getUploadUrl({ key, contentType: mimeType });

    return {
      success: true,
      url,
      key,
      fileName,
      fileSize,
      mimeType,
      clientId,
      title,
      category,
    };
  } catch {
    return { error: "Failed to prepare upload. Please try again." };
  }
}

const createDocumentSchema = documentInputSchema.extend({
  fileKey: z.string().min(1),
});

/**
 * Step 2 of the upload flow. Admin-only. Called after the browser has
 * successfully PUT the file directly to R2. Re-validates everything
 * (defense in depth) and sanity-checks the fileKey before persisting the
 * Document row.
 */
export async function createDocumentAction(input: {
  clientId: string;
  title: string;
  category: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  fileKey: string;
}): Promise<DocumentActionState> {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Not authorized." };
  }

  const parsed = createDocumentSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { clientId, title, category, fileName, fileSize, mimeType, fileKey } =
    parsed.data;

  const mimeOrSizeError = validateMimeAndSize(mimeType, fileSize);
  if (mimeOrSizeError) {
    return { error: mimeOrSizeError };
  }

  if (!fileKey.startsWith(`clients/${clientId}/`)) {
    return { error: "File key does not match the target client." };
  }

  try {
    await prisma.document.create({
      data: {
        clientId,
        uploadedBy: session.user.id,
        title,
        category,
        fileKey,
        fileName,
        fileSize,
        mimeType,
      },
    });
  } catch {
    // The file already landed in R2 (the browser's PUT succeeded before this
    // action was called) — without this, a failed DB write would orphan it.
    await deleteFile(fileKey).catch(() => {});
    return { error: "Failed to save document. Please try again." };
  }

  revalidatePath(`/admin/clients/${clientId}`);
  revalidatePath("/admin/dashboard");

  return { success: true };
}

const deleteDocumentSchema = z.string().min(1);

/**
 * Admin-only. Deletes the Document row first, then the underlying R2
 * object — if the object delete fails afterward, the worst case is a
 * harmless orphaned R2 object, never a DB row pointing at nothing.
 */
export async function deleteDocumentAction(
  documentId: string
): Promise<DocumentActionState> {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Not authorized." };
  }

  const parsed = deleteDocumentSchema.safeParse(documentId);
  if (!parsed.success) {
    return { error: "Invalid document id." };
  }

  try {
    const document = await prisma.document.findUnique({
      where: { id: parsed.data },
    });
    if (!document) {
      return { error: "Document not found." };
    }

    await prisma.document.delete({ where: { id: document.id } });
    await deleteFile(document.fileKey);

    revalidatePath(`/admin/clients/${document.clientId}`);
    revalidatePath("/admin/dashboard");

    return { success: true };
  } catch {
    return { error: "Failed to delete document. Please try again." };
  }
}
