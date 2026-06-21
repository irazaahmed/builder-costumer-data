"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteDocumentAction } from "@/lib/actions/documents";
import { Button } from "@/components/ui/button";

export function DeleteDocumentButton({ documentId }: { documentId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleClick() {
    if (!window.confirm("Delete this document? This cannot be undone.")) {
      return;
    }

    setPending(true);
    const result = await deleteDocumentAction(documentId);
    setPending(false);

    if (result.error) {
      window.alert(result.error);
      return;
    }

    router.refresh();
  }

  return (
    <Button
      variant="destructive"
      size="sm"
      disabled={pending}
      onClick={handleClick}
    >
      {pending ? "Deleting..." : "Delete"}
    </Button>
  );
}
