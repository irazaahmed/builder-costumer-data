import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Clock } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { PendingTable } from "./pending-table";

export default async function PendingPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  const [pendingUsers, availablePlots] = await Promise.all([
    prisma.user.findMany({
      where: { role: "CLIENT", status: "PENDING" },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        claimedCnic: true,
        claimedPlotNumber: true,
        createdAt: true,
      },
    }),
    prisma.plot.findMany({
      where: { client: null, status: { not: "CANCELLED" } },
      orderBy: { sortIndex: "asc" },
      select: { id: true, plotNumber: true },
    }),
  ]);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 p-6">
      <PageHeader
        icon={Clock}
        title="Pending Verification"
        description={`${pendingUsers.length} signup${
          pendingUsers.length === 1 ? "" : "s"
        } waiting to be linked to a plot.`}
        color="amber"
      />
      <PendingTable
        pendingUsers={pendingUsers.map((u) => ({ ...u, createdAt: u.createdAt.toISOString() }))}
        availablePlots={availablePlots}
      />
    </main>
  );
}
