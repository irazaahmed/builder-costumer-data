"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteNotificationAction } from "@/lib/actions/notifications";
import { Button } from "@/components/ui/button";

export function DeleteNotificationButton({
  notificationId,
}: {
  notificationId: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleClick() {
    if (
      !window.confirm(
        "Delete this notification for all clients? This cannot be undone."
      )
    ) {
      return;
    }

    setPending(true);
    const result = await deleteNotificationAction(notificationId);
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
