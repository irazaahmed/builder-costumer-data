"use client";

import { useState } from "react";
import { getDownloadUrlAction } from "@/lib/actions/documents";
import { Button } from "@/components/ui/button";

type PendingMode = "view" | "download" | null;

export function DocumentActions({ documentId }: { documentId: string }) {
  const [pending, setPending] = useState<PendingMode>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleClick(mode: "view" | "download") {
    setPending(mode);
    setError(null);

    const result = await getDownloadUrlAction(documentId, mode);
    setPending(null);

    if (result.error || !result.url) {
      setError(result.error ?? "Failed to generate link.");
      return;
    }

    window.open(result.url, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        disabled={pending !== null}
        onClick={() => handleClick("view")}
      >
        {pending === "view" ? "Opening..." : "View"}
      </Button>
      <Button
        variant="outline"
        size="sm"
        disabled={pending !== null}
        onClick={() => handleClick("download")}
      >
        {pending === "download" ? "Preparing..." : "Download"}
      </Button>
      {error ? <span className="text-xs text-destructive">{error}</span> : null}
    </div>
  );
}
