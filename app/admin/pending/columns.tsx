"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { LinkClientDialog } from "@/components/admin/link-client-dialog";

export interface PendingUserRow {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  claimedCnic: string | null;
  claimedPlotNumber: string | null;
  createdAt: string;
}

export interface AvailablePlotOption {
  id: string;
  plotNumber: string;
}

export function getColumns(
  availablePlots: AvailablePlotOption[]
): ColumnDef<PendingUserRow>[] {
  return [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "email", header: "Email" },
    { accessorKey: "phone", header: "Phone", cell: ({ row }) => row.original.phone ?? "—" },
    {
      accessorKey: "claimedCnic",
      header: "Claimed CNIC",
      cell: ({ row }) => row.original.claimedCnic ?? "—",
    },
    {
      accessorKey: "claimedPlotNumber",
      header: "Claimed Plot",
      cell: ({ row }) => row.original.claimedPlotNumber ?? "—",
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <LinkClientDialog user={row.original} availablePlots={availablePlots} />
      ),
    },
  ];
}
