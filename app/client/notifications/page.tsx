import { redirect } from "next/navigation";
import { Bell } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatFileSize } from "@/lib/format";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { NotificationActions } from "@/components/client/notification-actions";

export default async function ClientNotificationsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "CLIENT") {
    redirect("/login");
  }

  // Notifications are a broadcast, not scoped by clientId — but PENDING/
  // BLOCKED clients must still see nothing, same as documents.
  if (session.user.status !== "ACTIVE") {
    redirect("/client/dashboard");
  }

  const notifications = await prisma.notification.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 p-6">
      <PageHeader
        icon={Bell}
        title="Notifications"
        description="Announcements and documents shared with all clients."
      />

      <Card>
        <CardHeader>
          <CardTitle>All notifications ({notifications.length})</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {notifications.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No notifications yet.
            </p>
          ) : (
            notifications.map((n) => (
              <Card key={n.id} size="sm">
                <CardContent className="flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-medium">{n.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {n.createdAt.toLocaleDateString("en-GB")}
                    </span>
                  </div>
                  {n.message && (
                    <p className="text-sm text-muted-foreground">{n.message}</p>
                  )}
                  {n.fileKey && (
                    <>
                      <p className="text-xs text-muted-foreground">
                        Attachment: {n.fileName} ({formatFileSize(n.fileSize ?? 0)})
                      </p>
                      <NotificationActions notificationId={n.id} />
                    </>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </CardContent>
      </Card>
    </main>
  );
}
