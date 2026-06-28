"use client";

import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";

export interface PlotRow {
  id: string;
  plotNumber: string;
  status: string;
  client: { id: string; fullName: string } | null;
}

export const columns: ColumnDef<PlotRow>[] = [
  { accessorKey: "plotNumber", header: "Plot" },
  { accessorKey: "status", header: "Status" },
  {
    id: "client",
    header: "Linked Client",
    cell: ({ row }) => {
      const client = row.original.client;
      if (!client) return <Badge variant="outline">Unlinked</Badge>;
      return (
        <Link href={`/admin/clients/${client.id}`} className="text-primary underline">
          {client.fullName}
        </Link>
      );
    },
  },
];
