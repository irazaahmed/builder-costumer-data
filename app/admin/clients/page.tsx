import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { DataTable } from "@/components/data-table";
import { CreateClientDialog } from "@/components/admin/create-client-dialog";
import { columns } from "./columns";

export default async function ClientsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  const [clients, availablePlots] = await Promise.all([
    prisma.client.findMany({
      orderBy: { plot: { plotNumber: "asc" } },
      include: { plot: true, _count: { select: { documents: true } } },
    }),
    prisma.plot.findMany({
      where: { client: null },
      orderBy: { plotNumber: "asc" },
      select: { id: true, plotNumber: true },
    }),
  ]);

  const rows = clients.map((c) => ({
    id: c.id,
    fullName: c.fullName,
    cnic: c.cnic,
    phone: c.phone,
    plotNumber: c.plot.plotNumber,
    documentCount: c._count.documents,
  }));

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">Clients</h1>
          <p className="text-sm text-muted-foreground">
            {rows.length} linked client{rows.length === 1 ? "" : "s"}.
          </p>
        </div>
        <CreateClientDialog availablePlots={availablePlots} />
      </div>
      <p className="text-xs text-muted-foreground sm:hidden">Scroll right to see more →</p>
      <DataTable
        columns={columns}
        data={rows}
        searchPlaceholder="Search by name, plot, or CNIC..."
      />
    </main>
  );
}
