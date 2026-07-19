"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createGalleryFolderAction } from "@/lib/actions/gallery";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export function CreateGalleryFolderDialog() {
  const [open, setOpen] = useState(false);
  // Bump this on every open so the inner form is a fresh instance — the
  // Dialog hides content rather than unmounting it, so a stale error from
  // the last attempt would otherwise linger the next time it's reopened.
  const [instanceKey, setInstanceKey] = useState(0);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        onClick={() => {
          setInstanceKey((k) => k + 1);
          setOpen(true);
        }}
      >
        Create folder
      </Button>
      <CreateGalleryFolderForm key={instanceKey} onDone={() => setOpen(false)} />
    </Dialog>
  );
}

function CreateGalleryFolderForm({ onDone }: { onDone: () => void }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Title is required.");
      return;
    }

    setPending(true);
    const result = await createGalleryFolderAction({
      title,
      description: description.trim() || undefined,
    });
    setPending(false);

    if (result.error || !result.folderId) {
      setError(result.error ?? "Failed to create folder. Please try again.");
      return;
    }

    onDone();
    router.push(`/admin/gallery/${result.folderId}`);
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Create gallery folder</DialogTitle>
        <DialogDescription>
          A folder groups related photos and videos shown together on the
          public homepage gallery (e.g. &quot;Site Progress&quot;,
          &quot;Groundbreaking Ceremony&quot;).
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="folder-title">Title</Label>
          <Input
            id="folder-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Site Progress"
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="folder-description">Description (optional)</Label>
          <Textarea
            id="folder-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Shown under the folder title on the public site."
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <DialogFooter>
          <Button type="submit" disabled={pending}>
            {pending ? "Creating..." : "Create folder"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
