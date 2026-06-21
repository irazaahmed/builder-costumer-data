import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { CategoryBadge } from "@/components/category-badge";

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  const [clientCount, documentCount, pendingUsers, recentDocuments] =
    await Promise.all([
      prisma.client.count(),
      prisma.document.count(),
      prisma.user.findMany({
        where: { status: "PENDING" },
        orderBy: { createdAt: "asc" },
        take: 5,
        select: { id: true, name: true, claimedPlotNumber: true },
      }),
      prisma.document.findMany({
        orderBy: { uploadedAt: "desc" },
        take: 5,
        select: {
          id: true,
          title: true,
          category: true,
          uploadedAt: true,
          client: { select: { id: true, fullName: true } },
        },
      }),
    ]);

  const pendingCount = await prisma.user.count({ where: { status: "PENDING" } });

  return (
    <main className="flex flex-1 flex-col gap-6 p-6">
      <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>{clientCount}</CardTitle>
            <CardDescription>Linked clients</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{documentCount}</CardTitle>
            <CardDescription>Documents on file</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{pendingCount}</CardTitle>
            <CardDescription>Pending verification</CardDescription>
          </CardHeader>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Pending verification queue</CardTitle>
            <CardDescription>
              Signups waiting to be matched and linked to a plot.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {pendingUsers.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nothing pending right now.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {pendingUsers.map((u) => (
                  <li key={u.id} className="flex justify-between text-sm">
                    <span>{u.name}</span>
                    <span className="text-muted-foreground">
                      Claimed: {u.claimedPlotNumber ?? "—"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <Link href="/admin/pending" className={buttonVariants({ size: "sm", className: "self-start" })}>
              View all pending
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent uploads</CardTitle>
            <CardDescription>The last 5 documents added to the vault.</CardDescription>
          </CardHeader>
          <CardContent>
            {recentDocuments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No documents uploaded yet.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {recentDocuments.map((doc) => (
                  <li
                    key={doc.id}
                    className="flex flex-col gap-1 text-sm sm:flex-row sm:items-center sm:justify-between sm:gap-3"
                  >
                    <span className="flex flex-wrap items-center gap-2">
                      {doc.title}
                      <CategoryBadge category={doc.category} />
                    </span>
                    <Link
                      href={`/admin/clients/${doc.client.id}`}
                      className="text-xs text-muted-foreground hover:text-foreground hover:underline sm:text-sm sm:text-right"
                    >
                      {doc.client.fullName}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
