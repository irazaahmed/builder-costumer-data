import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { DataTable } from "@/components/data-table";
import { columns } from "./columns";

export default async function ClientsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  const clients = await prisma.client.findMany({
    orderBy: { plot: { plotNumber: "asc" } },
    include: { plot: true, _count: { select: { documents: true } } },
  });

  const rows = clients.map((c) => ({
    id: c.id,
    fullName: c.fullName,
    cnic: c.cnic,
    phone: c.phone,
    plotNumber: c.plot.plotNumber,
    documentCount: c._count.documents,
  }));

  return (
    <main className="flex flex-1 flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Clients</h1>
        <p className="text-sm text-muted-foreground">
          {rows.length} linked client{rows.length === 1 ? "" : "s"}.
        </p>
      </div>
      <DataTable
        columns={columns}
        data={rows}
        searchPlaceholder="Search by name, plot, or CNIC..."
      />
    </main>
  );
}
