"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Fires the given "mark as seen" server action once on mount, then
 * refreshes the route so the shared client layout re-fetches its unread-dot
 * data. Rendered inside /client/documents and /client/notifications so the
 * unread dot clears the moment the page is actually opened by the browser
 * — not on a Link prefetch, which only ever triggers this component's
 * parent Server Component to be fetched, never mounts it client-side.
 */
export function MarkSeen({
  action,
}: {
  action: () => Promise<{ success?: boolean; error?: string }>;
}) {
  const router = useRouter();

  useEffect(() => {
    action().then((result) => {
      if (result.success) {
        router.refresh();
      }
    });
    // Fire once per mount only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
