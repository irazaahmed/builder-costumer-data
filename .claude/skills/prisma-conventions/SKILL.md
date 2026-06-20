---
name: prisma-conventions
description: Schema patterns, naming, enum usage, and relation rules for this project's Prisma schema (User, Client, Plot, Document). Use when adding or editing any Prisma model, migration, or seed data, so naming and relations stay consistent with CLAUDE.md's data model. Do not use for storage or UI code.
---

# Prisma conventions for the Client Document Vault and Portal

These conventions keep `prisma/schema.prisma` consistent with the data model defined in the root `CLAUDE.md`. Read that file's "Data Model (Prisma Schema)" section first — this skill describes the *patterns*, not a copy of the schema itself.

## Naming

- Model names: PascalCase, singular (`User`, `Client`, `Plot`, `Document`) — never `Users`, `Clients`, etc.
- Enum names: PascalCase (`Role`, `UserStatus`, `DocumentCategory`); enum values: UPPER_SNAKE (`PENDING`, `ACTIVE`, `BLOCKED`).
- IDs: always `id String @id @default(cuid())`. Never use auto-increment ints for these models.
- Foreign key fields: `<relatedModel>Id` (e.g. `clientId`, `plotId`, `userId`).

## Relations

- One plot ↔ at most one client: enforced with `@unique` on `Client.plotId`, and `Plot.client` as an optional back-relation (`Client?`).
- One user ↔ at most one client profile: `@unique` on `Client.userId`.
- A client has many documents: `Document.clientId` is a plain (non-unique) foreign key; `Client.documents` is `Document[]`.
- Always add the explicit `@relation(fields: [...], references: [...])` on the *many* or owning side; let Prisma infer the back-relation array/optional type on the other side.

## Defaults and required fields

- `User.role` defaults to `CLIENT`; only seed data or an admin-only action ever creates a `Role.ADMIN` user.
- `User.status` defaults to `PENDING`. Status only becomes `ACTIVE` via the admin's link action (never set directly at signup).
- `Plot.status` defaults to `"SOLD"` (this project never models unsold plots — see CLAUDE.md "What NOT to Build Yet").
- `Document.category` defaults to `DocumentCategory.OTHER` — never make this field optional or skip it; CLAUDE.md calls out filtering by category as load-bearing UX for 360 clients with multiple documents each.

## What never goes in the schema

- No field stores PDF bytes or binary content. `Document.fileKey`, `fileName`, `fileSize`, `mimeType` are metadata only; the file itself lives in R2 (see the `r2-storage-pattern` skill).
- No payment/installment models — CLAUDE.md explicitly excludes payment tracking for now (all plots are already sold and paid).

## Migrations

- Use `npx prisma migrate dev --name <short-description>` for local schema changes once a real `DATABASE_URL` is set.
- Never hand-edit a migration that has already been applied to a shared database; create a new migration instead.
- Keep `prisma/seed.ts` idempotent-ish for dev convenience (safe to re-run against a fresh dev database), but it does not need to be safe to run twice against the same populated database.
