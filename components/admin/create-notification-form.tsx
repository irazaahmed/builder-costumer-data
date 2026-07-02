"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import {
  requestNotificationUploadAction,
  createNotificationAction,
} from "@/lib/actions/notifications";
import { formatFileSize } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export function CreateNotificationForm() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "application/pdf": [".pdf"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
    },
    maxSize: 25 * 1024 * 1024,
    multiple: false,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles[0]) {
        setFile(acceptedFiles[0]);
      }
    },
  });

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    if (!message.trim() && !file) {
      setError("Add a message or attach a file.");
      return;
    }

    setPending(true);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("message", message);

    if (file) {
      const requestResult = await requestNotificationUploadAction({
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
        setError(requestResult.error ?? "Failed to prepare upload.");
        setPending(false);
        return;
      }

      const uploadFormData = new FormData();
      for (const [field, value] of Object.entries(requestResult.fields)) {
        uploadFormData.append(field, value);
      }
      uploadFormData.append("file", file);

      let response: Response;
      let responseJson: { error?: { message?: string } } | null = null;
      try {
        response = await fetch(requestResult.url, {
          method: "POST",
          body: uploadFormData,
        });
        responseJson = await response.json().catch(() => null);
      } catch {
        setError("Upload to storage failed, please try again.");
        setPending(false);
        return;
      }

      if (!response.ok || responseJson?.error) {
        setError("Upload to storage failed, please try again.");
        setPending(false);
        return;
      }

      formData.append("fileKey", requestResult.key);
      formData.append("fileName", requestResult.fileName!);
      formData.append("fileSize", String(requestResult.fileSize!));
      formData.append("mimeType", requestResult.mimeType!);
    }

    const createResult = await createNotificationAction(undefined, formData);

    if (createResult.error) {
      setError(createResult.error);
      setPending(false);
      return;
    }

    setFile(null);
    setTitle("");
    setMessage("");
    setPending(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="notification-title">Title</Label>
        <Input
          id="notification-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Society general meeting"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="notification-message">Message (optional)</Label>
        <Textarea
          id="notification-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Write the announcement text here..."
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label>Attachment (optional)</Label>
        <div
          {...getRootProps()}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-input px-4 py-6 text-center transition-colors",
            isDragActive && "border-ring bg-muted"
          )}
        >
          <input {...getInputProps()} />
          {file ? (
            <p className="text-sm">
              {file.name}{" "}
              <span className="text-muted-foreground">
                ({formatFileSize(file.size)})
              </span>
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Drag and drop a PDF, JPEG, or PNG here, or click to select a file.
            </p>
          )}
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Sending..." : "Send to all clients"}
      </Button>
    </form>
  );
}
