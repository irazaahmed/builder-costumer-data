import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  const [clientCount, documentCount, pendingCount] = await Promise.all([
    prisma.client.count(),
    prisma.document.count(),
    prisma.user.count({ where: { status: "PENDING" } }),
  ]);

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
    </main>
  );
}
