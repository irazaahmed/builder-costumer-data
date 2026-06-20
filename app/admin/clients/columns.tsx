"use client";

import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { buttonVariants } from "@/components/ui/button";

export interface ClientRow {
  id: string;
  fullName: string;
  cnic: string | null;
  phone: string | null;
  plotNumber: string;
  documentCount: number;
}

export const columns: ColumnDef<ClientRow>[] = [
  { accessorKey: "fullName", header: "Name" },
  { accessorKey: "plotNumber", header: "Plot" },
  { accessorKey: "cnic", header: "CNIC", cell: ({ row }) => row.original.cnic ?? "—" },
  { accessorKey: "phone", header: "Phone", cell: ({ row }) => row.original.phone ?? "—" },
  { accessorKey: "documentCount", header: "Documents" },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <Link
        href={`/admin/clients/${row.original.id}`}
        className={buttonVariants({ size: "sm", variant: "outline" })}
      >
        View
      </Link>
    ),
  },
];
