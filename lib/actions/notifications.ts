"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  buildNotificationKey,
  getUploadUrl,
  getDownloadUrl,
  deleteFile,
} from "@/lib/storage";

export interface NotificationActionState {
  error?: string;
  success?: boolean;
}

const ALLOWED_MIME_TYPES = ["application/pdf", "image/jpeg", "image/png"] as const;
const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB

function validateMimeAndSize(mimeType: string, fileSize: number): string | null {
  if (!ALLOWED_MIME_TYPES.includes(mimeType as (typeof ALLOWED_MIME_TYPES)[number])) {
    return "Only PDF, JPEG, or PNG files are allowed.";
  }
  if (fileSize <= 0 || fileSize > MAX_FILE_SIZE_BYTES) {
    return "File size must be greater than 0 and at most 25 MB.";
  }
  return null;
}

const requestUploadSchema = z.object({
  fileName: z.string().min(1),
  fileSize: z.coerce.number().int().positive(),
  mimeType: z.string().min(1),
});

export interface RequestNotificationUploadResult extends NotificationActionState {
  url?: string;
  fields?: Record<string, string>;
  key?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
}

/**
 * Step 1 of the optional-attachment upload flow. Admin-only. Mirrors
 * requestUploadAction in lib/actions/documents.ts, but the resulting key is
 * not scoped to any single client — the notification it belongs to is
 * broadcast to every active client.
 */
export async function requestNotificationUploadAction(input: {
  fileName: string;
  fileSize: number;
  mimeType: string;
}): Promise<RequestNotificationUploadResult> {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Not authorized." };
  }

  const parsed = requestUploadSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { fileName, fileSize, mimeType } = parsed.data;

  const mimeOrSizeError = validateMimeAndSize(mimeType, fileSize);
  if (mimeOrSizeError) {
    return { error: mimeOrSizeError };
  }

  try {
    const key = buildNotificationKey(fileName);
    const { url, fields } = await getUploadUrl({ key, contentType: mimeType });
    return { success: true, url, fields, key, fileName, fileSize, mimeType };
  } catch {
    return { error: "Failed to prepare upload. Please try again." };
  }
}

const createNotificationSchema = z
  .object({
    title: z.string().trim().min(2, "Title must be at least 2 characters."),
    message: z.string().trim().optional(),
    fileKey: z.string().trim().optional(),
    fileName: z.string().trim().optional(),
    fileSize: z.coerce.number().int().positive().optional(),
    mimeType: z.string().trim().optional(),
  })
  .refine((data) => data.message || data.fileKey, {
    message: "Add a message or attach a file.",
    path: ["message"],
  });

/**
 * Admin-only. Creates a Notification row visible to every active client.
 * If a file was attached, the browser must have already POSTed it to
 * storage via requestNotificationUploadAction's signed URL before this is
 * called (fileKey/fileName/fileSize/mimeType are only re-validated here,
 * not uploaded here).
 */
export async function createNotificationAction(
  _prevState: NotificationActionState | undefined,
  formData: FormData
): Promise<NotificationActionState> {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Not authorized." };
  }

  const parsed = createNotificationSchema.safeParse({
    title: formData.get("title"),
    message: formData.get("message") || undefined,
    fileKey: formData.get("fileKey") || undefined,
    fileName: formData.get("fileName") || undefined,
    fileSize: formData.get("fileSize") || undefined,
    mimeType: formData.get("mimeType") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { title, message, fileKey, fileName, fileSize, mimeType } = parsed.data;

  if (fileKey) {
    if (!fileName || !fileSize || !mimeType) {
      return { error: "Missing attachment details." };
    }
    const mimeOrSizeError = validateMimeAndSize(mimeType, fileSize);
    if (mimeOrSizeError) {
      return { error: mimeOrSizeError };
    }
    if (!fileKey.startsWith("notifications/")) {
      return { error: "File key is invalid." };
    }
  }

  try {
    await prisma.notification.create({
      data: {
        title,
        message,
        fileKey,
        fileName,
        fileSize,
        mimeType,
        createdBy: session.user.id,
      },
    });
  } catch {
    if (fileKey) {
      await deleteFile(fileKey).catch(() => {});
    }
    return { error: "Failed to save notification. Please try again." };
  }

  revalidatePath("/admin/notifications");
  revalidatePath("/client/notifications");

  return { success: true };
}

const notificationIdSchema = z.string().min(1);

/**
 * Admin-only. Deletes the Notification row first, then the underlying
 * storage object if one was attached — worst case on a later failure is a
 * harmless orphaned storage object, never a DB row pointing at nothing.
 */
export async function deleteNotificationAction(
  notificationId: string
): Promise<NotificationActionState> {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Not authorized." };
  }

  const parsed = notificationIdSchema.safeParse(notificationId);
  if (!parsed.success) {
    return { error: "Invalid notification id." };
  }

  try {
    const notification = await prisma.notification.findUnique({
      where: { id: parsed.data },
    });
    if (!notification) {
      return { error: "Notification not found." };
    }

    await prisma.notification.delete({ where: { id: notification.id } });
    if (notification.fileKey) {
      await deleteFile(notification.fileKey);
    }

    revalidatePath("/admin/notifications");
    revalidatePath("/client/notifications");

    return { success: true };
  } catch {
    return { error: "Failed to delete notification. Please try again." };
  }
}

const getDownloadUrlSchema = z.object({
  notificationId: z.string().min(1),
  mode: z.enum(["view", "download"]),
});

/**
 * Any authenticated, ACTIVE client, or an admin. Unlike
 * getDownloadUrlAction in lib/actions/documents.ts, there is deliberately no
 * per-client ownership check — a Notification's attachment is broadcast to
 * every active client by design, not scoped to one client's own documents.
 * Role/status is still re-checked here rather than trusting an earlier
 * page-level check.
 */
export async function getNotificationDownloadUrlAction(
  notificationId: string,
  mode: "view" | "download"
): Promise<NotificationActionState & { url?: string }> {
  const session = await auth();
  const isAdmin = session?.user?.role === "ADMIN";
  const isActiveClient =
    session?.user?.role === "CLIENT" && session.user.status === "ACTIVE";
  if (!session?.user || (!isAdmin && !isActiveClient)) {
    return { error: "Not authorized." };
  }

  const parsed = getDownloadUrlSchema.safeParse({ notificationId, mode });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  try {
    const notification = await prisma.notification.findUnique({
      where: { id: parsed.data.notificationId },
    });

    if (!notification || !notification.fileKey) {
      return { error: "Notification not found." };
    }

    const url = await getDownloadUrl(
      notification.fileKey,
      parsed.data.mode === "download"
        ? { download: true, fileName: notification.fileName ?? undefined }
        : undefined
    );

    return { success: true, url };
  } catch {
    return { error: "Failed to generate download link. Please try again." };
  }
}

/**
 * Client-only. Stamps the session's own client with "notifications seen
 * now," powering the unread dot on the Notifications nav link. Scoped by
 * session.user.clientId only, never by an id the caller could supply.
 */
export async function markNotificationsSeenAction(): Promise<NotificationActionState> {
  const session = await auth();
  if (
    !session?.user ||
    session.user.role !== "CLIENT" ||
    session.user.status !== "ACTIVE" ||
    !session.user.clientId
  ) {
    return { error: "Not authorized." };
  }

  await prisma.client.update({
    where: { id: session.user.clientId },
    data: { notificationsSeenAt: new Date() },
  });

  return { success: true };
}
