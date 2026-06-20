---
name: shadcn-admin-table
description: Standard reusable TanStack Table plus shadcn/ui table setup (search, pagination, column filters) for admin list views like /admin/clients and /admin/plots. Use when building any admin list/table page in this project.
---

# shadcn/ui + TanStack Table pattern for admin lists

This project's admin panel has at least three list views that need the same shape: `/admin/clients` (360 clients, searchable by name/plot number/CNIC), `/admin/plots` (P-001 to P-360), and `/admin/pending` (pending verification queue). Build one reusable pattern, not three one-off tables.

## Structure

- `components/data-table.tsx` — a generic wrapper component taking `columns` and `data`, built on `@tanstack/react-table`'s `useReactTable` plus the shadcn `Table`/`TableHeader`/`TableBody`/`TableRow`/`TableCell` primitives already in `components/ui/table.tsx`.
- Per-page `columns.tsx` (e.g. `app/admin/clients/columns.tsx`) defining the `ColumnDef[]` for that specific list — name, plot number, CNIC, status badge, actions, etc.
- The page component fetches data (Server Component) and passes it into the shared `DataTable` (Client Component) for interactivity.

## Required features on every admin list

- **Search**: a text input bound to a column filter (e.g. global filter across name/plot number/CNIC) using TanStack's `globalFilterFn` or per-column `filterFn`.
- **Pagination**: TanStack's built-in pagination state (`getPaginationRowModel`), with shadcn `Button`s for prev/next and a page-size indicator. Don't render all 360 rows unpaginated.
- **Status display**: use the shadcn `Badge` component for `UserStatus`/plot status, with consistent variant-to-status mapping (e.g. `PENDING` = outline/yellow, `ACTIVE` = default/green, `BLOCKED` = destructive/red) defined once and reused.
- **Row actions**: a `DropdownMenu` (already installed) per row for actions like "View", "Link to plot", "Delete" — gated by the same role checks as the underlying Server Actions (don't show an action the session can't actually perform).

## Branding

Tables use Tailwind tokens (`bg-card`, `text-muted-foreground`, etc.) already wired in `app/globals.css` — never hardcode colors. See `lib/branding.ts` for any text (e.g. empty-state copy) that should route through the central config instead of being typed inline.
