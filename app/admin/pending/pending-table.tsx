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
    <DataTable
      columns={columns}
      data={pendingUsers}
      searchPlaceholder="Search by name, email, CNIC, or plot..."
    />
  );
}
