"use client";

import { DataTable } from "@/components/data-table";
import { getColumns, type PendingUserRow, type AvailablePlotOption } from "./columns";

export function PendingTable({
  pendingUsers,
  availablePlots,
}: {
  pendingUsers: PendingUserRow[];
  availablePlots: AvailablePlotOption[];
}) {
  const columns = getColumns(availablePlots);
  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs text-muted-foreground sm:hidden">Scroll right to see more →</p>
      <DataTable
        columns={columns}
        data={pendingUsers}
        searchPlaceholder="Search by name, email, CNIC, or plot..."
      />
    </div>
  );
}
