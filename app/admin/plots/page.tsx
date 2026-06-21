import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { DataTable } from "@/components/data-table";
import { columns } from "./columns";

export default async function PlotsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  const plots = await prisma.plot.findMany({
    orderBy: { plotNumber: "asc" },
    include: { client: { select: { id: true, fullName: true } } },
  });

  return (
    <main className="flex flex-1 flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Plots</h1>
        <p className="text-sm text-muted-foreground">
          {plots.filter((p) => p.client).length} of {plots.length} linked.
        </p>
      </div>
      <p className="text-xs text-muted-foreground sm:hidden">Scroll right to see more →</p>
      <DataTable columns={columns} data={plots} searchPlaceholder="Search by plot number..." />
    </main>
  );
}
