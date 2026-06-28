import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { LandPlot } from "lucide-react";
import { DataTable } from "@/components/data-table";
import { PageHeader } from "@/components/page-header";
import { columns } from "./columns";

export default async function PlotsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  const plots = await prisma.plot.findMany({
    orderBy: { sortIndex: "asc" },
    include: { client: { select: { id: true, fullName: true } } },
  });

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 p-6">
      <PageHeader
        icon={LandPlot}
        title="Plots"
        description={`${plots.filter((p) => p.client).length} of ${plots.length} linked.`}
        color="gold"
      />
      <p className="text-xs text-muted-foreground sm:hidden">Scroll right to see more →</p>
      <DataTable columns={columns} data={plots} searchPlaceholder="Search by plot number..." />
    </main>
  );
}
