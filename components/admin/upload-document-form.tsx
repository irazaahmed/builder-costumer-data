"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import {
  requestUploadAction,
  createDocumentAction,
} from "@/lib/actions/documents";
import { formatFileSize } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const CATEGORIES = ["LEGAL", "PAYMENT", "ALLOTMENT", "CNIC", "OTHER"] as const;
type Category = (typeof CATEGORIES)[number];

export function UploadDocumentForm({ clientId }: { clientId: string }) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<Category>("OTHER");
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

    if (!file) {
      setError("Please select a file to upload.");
      return;
    }
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }

    setPending(true);

    const requestResult = await requestUploadAction({
      clientId,
      title,
      category,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
    });

    if (requestResult.error || !requestResult.url || !requestResult.key) {
      setError(requestResult.error ?? "Failed to prepare upload.");
      setPending(false);
      return;
    }

    const response = await fetch(requestResult.url, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    });

    if (!response.ok) {
      setError("Upload to storage failed, please try again.");
      setPending(false);
      return;
    }

    const createResult = await createDocumentAction({
      clientId,
      title: requestResult.title!,
      category: requestResult.category!,
      fileName: requestResult.fileName!,
      fileSize: requestResult.fileSize!,
      mimeType: requestResult.mimeType!,
      fileKey: requestResult.key!,
    });

    if (createResult.error) {
      setError(createResult.error);
      setPending(false);
      return;
    }

    setFile(null);
    setTitle("");
    setCategory("OTHER");
    setPending(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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

      <div className="flex flex-col gap-2">
        <Label htmlFor="document-title">Title</Label>
        <Input
          id="document-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Sale Agreement"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="document-category">Category</Label>
        <Select
          value={category}
          onValueChange={(value) => setCategory(value as Category)}
        >
          <SelectTrigger id="document-category" className="w-full">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((value) => (
              <SelectItem key={value} value={value}>
                {value}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Uploading..." : "Upload document"}
      </Button>
    </form>
  );
}
