---
description: Scaffold a new admin or client page with auth guard, layout, and branding
argument-hint: [admin|client] [page-name]
---

Create a new page for the Client Document Vault and Portal project: panel = `$1`, page name = `$2`.

Requirements:

1. Route location: `/admin/$2` if panel is `admin`, `/client/$2` if panel is `client` — matching the routes already listed in CLAUDE.md's "Routes and Panels" section if this page is one of those; otherwise place it consistently alongside its siblings.
2. The page must assume `middleware.ts` already enforces role (`ADMIN` for `/admin/*`, `CLIENT` for `/client/*`) and status (`ACTIVE` for `/client/*`) — but double-check the Server Component itself also reads the session via `auth()` rather than trusting middleware alone for data access.
3. Use branding from `lib/branding.ts` for any site name/copy — never a hardcoded literal.
4. If the page renders a list of records (clients, plots, documents, pending signups), follow the `shadcn-admin-table` skill's pattern instead of a one-off table.
5. If the page includes any mutation (upload, delete, link, edit), follow the `server-action-pattern` skill and, if it touches access control, run `/audit-security` on it afterward.
