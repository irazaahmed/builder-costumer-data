import { redirect } from "next/navigation";
import { Bell } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatFileSize } from "@/lib/format";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { CreateNotificationForm } from "@/components/admin/create-notification-form";
import { DeleteNotificationButton } from "@/components/admin/delete-notification-button";
import { NotificationActions } from "@/components/client/notification-actions";

export default async function AdminNotificationsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  const notifications = await prisma.notification.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 p-6">
      <PageHeader
        icon={Bell}
        title="Notifications"
        description="Send an announcement or document to every linked client at once."
      />

      <Card>
        <CardHeader>
          <CardTitle>New notification</CardTitle>
          <CardDescription>
            This reaches every active client — not just one, like a document
            upload does.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CreateNotificationForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sent ({notifications.length})</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {notifications.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No notifications sent yet.
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
                    <p className="text-xs text-muted-foreground">
                      Attachment: {n.fileName} ({formatFileSize(n.fileSize ?? 0)})
                    </p>
                  )}
                  <div className="flex items-center gap-2">
                    {n.fileKey && <NotificationActions notificationId={n.id} />}
                    <DeleteNotificationButton notificationId={n.id} />
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </CardContent>
      </Card>
    </main>
  );
}
