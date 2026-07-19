"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import { CheckCircle2, Loader2, UploadCloud, XCircle } from "lucide-react";
import {
  requestGalleryUploadAction,
  saveGalleryItemAction,
} from "@/lib/actions/gallery";
import { formatFileSize } from "@/lib/format";
import { cn } from "@/lib/utils";

type UploadStatus = "uploading" | "done" | "error";

interface QueueItem {
  id: string;
  file: File;
  status: UploadStatus;
  error?: string;
}

/**
 * The exact two-step signed-upload flow from UploadDocumentForm
 * (requestUploadAction -> direct browser POST to Cloudinary ->
 * createDocumentAction), swapped for the gallery's step-1/step-2 actions and
 * run once per file so multiple files dropped together upload in parallel.
 */
async function uploadOneFile(
  folderId: string,
  file: File
): Promise<{ error?: string }> {
  const requestResult = await requestGalleryUploadAction({
    folderId,
    fileName: file.name,
    fileSize: file.size,
    mimeType: file.type,
  });

  if (
    requestResult.error ||
    !requestResult.url ||
    !requestResult.fields ||
    !requestResult.key
  ) {
    return { error: requestResult.error ?? "Failed to prepare upload." };
  }

  const formData = new FormData();
  for (const [field, value] of Object.entries(requestResult.fields)) {
    formData.append(field, value);
  }
  formData.append("file", file);

  let response: Response;
  let responseJson: { error?: { message?: string }; format?: string } | null = null;
  try {
    response = await fetch(requestResult.url, {
      method: "POST",
      body: formData,
    });
    responseJson = await response.json().catch(() => null);
  } catch {
    return { error: "Upload to storage failed, please try again." };
  }

  if (!response.ok || responseJson?.error || !responseJson?.format) {
    return { error: "Upload to storage failed, please try again." };
  }

  const saveResult = await saveGalleryItemAction({
    folderId,
    fileKey: requestResult.key,
    format: responseJson.format,
    fileName: requestResult.fileName!,
    fileSize: requestResult.fileSize!,
    mimeType: requestResult.mimeType!,
  });

  if (saveResult.error) {
    return { error: saveResult.error };
  }

  return {};
}

export function UploadGalleryForm({ folderId }: { folderId: string }) {
  const router = useRouter();
  const [queue, setQueue] = useState<QueueItem[]>([]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const items: QueueItem[] = acceptedFiles.map((file) => ({
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}-${file.name}`,
        file,
        status: "uploading",
      }));

      setQueue((prev) => [...prev, ...items]);

      for (const item of items) {
        uploadOneFile(folderId, item.file).then((result) => {
          setQueue((prev) =>
            prev.map((q) =>
              q.id === item.id
                ? { ...q, status: result.error ? "error" : "done", error: result.error }
                : q
            )
          );
          if (!result.error) {
            router.refresh();
          }
        });
      }
    },
    [folderId, router]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
      "image/gif": [".gif"],
      "video/mp4": [".mp4"],
      "video/webm": [".webm"],
      "video/quicktime": [".mov"],
    },
    maxSize: 200 * 1024 * 1024,
    multiple: true,
    onDrop,
  });

  return (
    <div className="flex flex-col gap-3">
      <div
        {...getRootProps()}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-input px-4 py-8 text-center transition-colors",
          isDragActive && "border-ring bg-muted"
        )}
      >
        <input {...getInputProps()} />
        <UploadCloud className="size-6 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Drag and drop photos or videos here, or click to select files.
          <br />
          Images up to 25 MB, videos up to 200 MB. Multiple files at once are
          fine.
        </p>
      </div>

      {queue.length > 0 && (
        <ul className="flex flex-col gap-1.5">
          {queue.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between gap-3 rounded-lg bg-muted px-3 py-2 text-sm"
            >
              <span className="truncate">
                {item.file.name}{" "}
                <span className="text-xs text-muted-foreground">
                  ({formatFileSize(item.file.size)})
                </span>
              </span>
              <span className="flex shrink-0 items-center gap-1.5 text-xs">
                {item.status === "uploading" && (
                  <>
                    <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
                    Uploading...
                  </>
                )}
                {item.status === "done" && (
                  <>
                    <CheckCircle2 className="size-3.5 text-primary" />
                    Uploaded
                  </>
                )}
                {item.status === "error" && (
                  <>
                    <XCircle className="size-3.5 text-destructive" />
                    <span className="text-destructive">
                      {item.error ?? "Failed"}
                    </span>
                  </>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
