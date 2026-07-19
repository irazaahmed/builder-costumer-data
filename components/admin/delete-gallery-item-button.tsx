"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deleteGalleryItemAction } from "@/lib/actions/gallery";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function DeleteGalleryItemButton({
  itemId,
  className,
}: {
  itemId: string;
  className?: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleClick() {
    if (!window.confirm("Delete this item? This cannot be undone.")) {
      return;
    }

    setPending(true);
    const result = await deleteGalleryItemAction(itemId);
    setPending(false);

    if (result.error) {
      window.alert(result.error);
      return;
    }

    router.refresh();
  }

  return (
    <Button
      type="button"
      variant="destructive"
      size="icon-sm"
      disabled={pending}
      onClick={handleClick}
      className={cn("absolute top-1.5 right-1.5 shadow-sm", className)}
    >
      <Trash2 />
      <span className="sr-only">Delete</span>
    </Button>
  );
}
