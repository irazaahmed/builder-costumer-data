import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PortalHeader } from "@/components/portal-header";

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Unread-dot state for the Documents/Notifications nav links — only
  // meaningful for a linked, active client, scoped by session.user.clientId.
  let hasNewDocuments = false;
  let hasNewNotifications = false;

  if (
    session?.user?.role === "CLIENT" &&
    session.user.status === "ACTIVE" &&
    session.user.clientId
  ) {
    const [client, latestDocument, latestNotification] = await Promise.all([
      prisma.client.findUnique({
        where: { id: session.user.clientId },
        select: { documentsSeenAt: true, notificationsSeenAt: true },
      }),
      prisma.document.findFirst({
        where: { clientId: session.user.clientId },
        orderBy: { uploadedAt: "desc" },
        select: { uploadedAt: true },
      }),
      prisma.notification.findFirst({
        orderBy: { createdAt: "desc" },
        select: { createdAt: true },
      }),
    ]);

    hasNewDocuments = Boolean(
      latestDocument &&
        (!client?.documentsSeenAt || latestDocument.uploadedAt > client.documentsSeenAt)
    );
    hasNewNotifications = Boolean(
      latestNotification &&
        (!client?.notificationsSeenAt ||
          latestNotification.createdAt > client.notificationsSeenAt)
    );
  }

  const NAV_LINKS = [
    { href: "/client/dashboard", label: "Dashboard" },
    { href: "/client/documents", label: "Documents", showDot: hasNewDocuments },
    {
      href: "/client/notifications",
      label: "Notifications",
      showDot: hasNewNotifications,
    },
    { href: "/client/profile", label: "Profile" },
    { href: "/client/settings", label: "Settings" },
  ];

  return (
    <div className="flex flex-1 flex-col">
      <PortalHeader navLinks={NAV_LINKS} homeHref="/client/dashboard" />
      {children}
    </div>
  );
}
