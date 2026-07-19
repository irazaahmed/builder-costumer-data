"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { deleteGalleryFolderAction } from "@/lib/actions/gallery";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface DeleteGalleryFolderDialogProps {
  folderId: string;
  folderTitle: string;
  itemCount: number;
}

export function DeleteGalleryFolderDialog(props: DeleteGalleryFolderDialogProps) {
  const [open, setOpen] = useState(false);
  // Same "fresh instance on every open" trick as DeleteClientDialog — the
  // Dialog hides content instead of unmounting it.
  const [instanceKey, setInstanceKey] = useState(0);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        variant="destructive"
        onClick={() => {
          setInstanceKey((k) => k + 1);
          setOpen(true);
        }}
      >
        Delete folder
      </Button>
      <DeleteGalleryFolderForm key={instanceKey} {...props} />
    </Dialog>
  );
}

function DeleteGalleryFolderForm({
  folderId,
  folderTitle,
  itemCount,
}: DeleteGalleryFolderDialogProps) {
  const router = useRouter();
  const [confirmation, setConfirmation] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Client-side gate: the button stays disabled until the typed value
  // matches the folder title exactly. deleteGalleryFolderAction only takes
  // a folderId (no confirmation param), so this check is enforced here only
  // — still worth doing to prevent an accidental click on a destructive
  // action that also deletes every file inside the folder.
  const matches =
    confirmation.trim().toLowerCase() === folderTitle.trim().toLowerCase();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!matches) return;

    setPending(true);
    setError(null);
    const result = await deleteGalleryFolderAction(folderId);
    setPending(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    router.push("/admin/gallery");
    router.refresh();
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Delete this folder?</DialogTitle>
        <DialogDescription>
          This permanently deletes <strong>{folderTitle}</strong> and all{" "}
          {itemCount} {itemCount === 1 ? "item" : "items"} inside it —
          including the files in storage. This cannot be undone.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="folder-confirmation">
            Type the folder title{" "}
            <span className="font-semibold text-foreground">{folderTitle}</span>{" "}
            to confirm
          </Label>
          <Input
            id="folder-confirmation"
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            placeholder={folderTitle}
            autoComplete="off"
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <DialogFooter>
          <Button
            type="submit"
            variant="destructive"
            disabled={pending || !matches}
          >
            {pending ? "Deleting..." : "Delete folder permanently"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
