# CLAUDE.md

## Project: Client Document Vault and Portal

A secure document management portal for a real estate builder. The builder has a 17-acre project in Surjani Sector 12, Karachi, with 360 plots, all SOLD. There are 360 clients. The admin uploads each client's legal and other documents as PDFs. Each client logs in and views or downloads only their own documents.

This is a **document vault plus client portal**, NOT an inventory or sales system. The core challenge is **secure file storage and strict access control**, not complex business logic.

Build with **dummy data first** (dummy clients, dummy plots, sample PDFs), structured so it swaps to real data later without code changes. Initial deploy to **Vercel**, later moved to **Hostinger** with a purchased domain.

---

## Branding (Finalized)

The brand identity is now decided:

- **Name:** "Lodhi Brothers Housing Society" (short form "Lodhi Brothers" for tight spaces).
- **Color theme:** deep **emerald green** (`#0F5132` / strong `#157347`) as the primary, with **gold** (`#C8A04D`, light `#E3C77B`) as the accent — the premium real-estate convention (rich primary + gold).
- **Logo:** a theme-adaptive rooftop-house badge + wordmark (`components/brand-logo.tsx`, drawn with CSS theme vars so it adapts to light/dark) plus a matching standalone `public/logo.svg` for the favicon/OG.
- **Themes:** full **light + dark** support via `next-themes` (`components/theme-provider.tsx`), toggled from every navbar (`components/theme-toggle.tsx`). Light is the default.

The centralization rules still stand and MUST be followed for any future change:

- ALL branding values live in ONE config file, `lib/branding.ts` (site name, short name, tagline, brand colors, palette, logo path, contact info). Do NOT hardcode the name, colors, logo, or fonts anywhere else.
- Every component reads branding from this config / Tailwind theme tokens / CSS variables — never literal brand strings or color hex values inline (the one allowed exception is the fixed paper-white wall in the logo art).
- Color flow: `lib/branding.ts` → injected as `--brand*` / `--gold*` CSS vars on `<html>` (`app/layout.tsx`) → derived into shadcn theme tokens for both themes in `app/globals.css`. This keeps per-theme tuning while preserving one-file rebranding.
- The logo stays a single swappable file (`public/logo.svg`) plus the `BrandLogo` component, both reading from the config.

Goal (unchanged): rebranding the entire site — both themes — should still be a single edit to `lib/branding.ts` (plus the one logo file). No find-and-replace across many files.

---

## Most Important Architectural Rule

PDF files are NEVER stored in the database. The database stores only text metadata and a reference (storage key) to each file. The actual PDF lives in object storage.

```
Database (Postgres)   -> text data: who, which plot, document metadata, storage key
Object storage        -> the actual PDF files, in a PRIVATE bucket
```

---

## Tech Stack (Use Exactly This)

- **Next.js 15** with App Router and Server Actions
- **TypeScript** (strict mode)
- **PostgreSQL** for the database (Supabase or Neon, both fine, free tier is enough for text data)
- **Cloudinary** for file storage (the PDFs), private "raw" resources only
- **Prisma ORM** for the database layer
- **Auth.js (NextAuth v5)** for authentication and role-based access
- **Tailwind CSS + shadcn/ui** for UI
- **Zod** for all server-side validation
- **TanStack Table** for admin client/document tables
- **react-dropzone** for the admin upload UI
- **cloudinary** (official Node SDK) for signed direct-to-storage uploads and signed downloads

Storage choice reasoning: the database holds only text (clients, plots, document metadata), so any free Postgres works. The actual PDF files go to **Cloudinary** because its free tier needs no payment card on file (unlike Cloudflare R2, which requires one to enable R2 even on the free tier). Files are stored as `resource_type: "raw"` with delivery `type: "private"`, so they're never processed by Cloudinary's image pipeline and are only ever reachable via a signed URL.

**Critical**: all storage access (upload signing, download signing, delete) must go through ONE wrapper module `lib/storage.ts`. The rest of the app never talks to Cloudinary directly. This keeps the provider swappable. The wrapper exposes `getUploadUrl()`, `getDownloadUrl()`, and `deleteFile()`.

---

## Core Actors

1. **Admin**: Full control. Manages clients, links signups to plots, uploads documents per client, sees everything.
2. **Client**: Read-only. Logs in, sees and downloads ONLY their own documents. Cannot upload.
3. **System**: Handles secure upload, signed URLs, and the signup-to-plot linking flow.

---

## Authentication and Linking Flow (Read Carefully)

Clients self-signup, but the admin links them to a plot before they can see anything.

1. Client signs up with email, password, name, phone, and their **CNIC and/or plot number** as a claim.
2. New client account starts in status `PENDING` (unlinked). In this state they see a "your account is under verification" screen and NO documents.
3. Admin sees a **pending verification list** on the dashboard.
4. Admin matches the client to the correct plot/client record and links them. Status becomes `ACTIVE`.
5. Only after linking does the client see their plot info and documents.

This prevents a random signup from ever accessing someone else's documents. The link action is admin-only and must be logged.

Admin accounts are seeded, not self-signup.

**Alternative: admin-created clients.** The admin can also create a client directly from `/admin/clients` (`createClientAction`), skipping self-signup/PENDING entirely — the admin sets the client's name, email, initial password, phone, CNIC, and plot in one step, and the account goes straight to `ACTIVE`. Use this when onboarding a client who won't self-signup. There is no email/SMS in this app, so the admin must relay the password to the client manually; the password is shown once, in plain text, right after creation.

---

## Data Model (Prisma Schema)

```prisma
model User {
  id        String   @id @default(cuid())
  name      String
  email     String   @unique
  password  String
  phone     String?
  role      Role     @default(CLIENT)
  status    UserStatus @default(PENDING)
  // claim fields submitted at signup, used by admin to verify
  claimedCnic        String?
  claimedPlotNumber  String?
  client    Client?
  createdAt DateTime @default(now())
}

enum Role {
  ADMIN
  CLIENT
}

enum UserStatus {
  PENDING   // signed up, not yet linked by admin
  ACTIVE    // linked to a plot, can see documents
  BLOCKED
}

model Client {
  id             String     @id @default(cuid())
  user           User       @relation(fields: [userId], references: [id])
  userId         String     @unique
  fullName       String
  cnic           String?
  phone          String?
  address        String?
  membershipDate DateTime?           // date of membership (from the member list)
  plot           Plot       @relation(fields: [plotId], references: [id])
  plotId         String     @unique
  documents      Document[]
  linkedBy       String              // admin user id who performed the link
  createdAt      DateTime   @default(now())
}

model Plot {
  id         String   @id @default(cuid())
  plotNumber String   @unique   // real scheme: R-01..R-322, L-01..L-37
  status     String   @default("SOLD")  // "SOLD", or "CANCELLED" (e.g. R-248)
  client     Client?
}

model Document {
  id         String          @id @default(cuid())
  client     Client          @relation(fields: [clientId], references: [id])
  clientId   String
  uploadedBy String           // admin user id
  title      String           // e.g. "Sale Agreement"
  category   DocumentCategory @default(OTHER)
  fileKey    String           // storage path, NOT a public url
  fileName   String
  fileSize   Int
  mimeType   String
  uploadedAt DateTime         @default(now())
}

enum DocumentCategory {
  LEGAL
  PAYMENT
  ALLOTMENT
  CNIC
  OTHER
}
```

Design note: the `category` field is deliberate. With 360 clients each having multiple documents, filtering by category (legal, payment, allotment, CNIC) keeps both admin and client views usable. Do not skip it.

---

## File Storage and Security (Non-Negotiable)

All file storage is on **Cloudinary**, as private `resource_type: "raw"` objects, accessed via `lib/storage.ts`. Access is only ever through signed URLs.

1. Every object MUST use delivery `type: "private"`. Never `"upload"` (public) and never `"authenticated"` (requires Cloudinary's paid Advanced plan for token/cookie access control).
2. Uploads use a **signed direct-to-Cloudinary POST**, so large scanned PDFs do not pass through the Next.js server memory. The flow:
   - Admin picks a client and a file.
   - Server action validates admin role, then `lib/storage.ts` generates signed upload params (`getUploadUrl`) for key/`public_id` `clients/{clientId}/{category}/{timestamp}-{filename}`.
   - Browser builds a `FormData` (the file plus the signed fields) and POSTs it directly to Cloudinary using that signed data.
   - On success, server saves the `Document` row with the `fileKey` (the Cloudinary `public_id`).
3. Viewing/downloading uses **short-lived signed URLs** (`expires_at` 5 to 10 minutes out). Never store or expose permanent public links.
4. Every download request re-checks: is this user allowed to access this document? A client may only get a signed URL for a document whose `clientId` matches their own client id.
5. Restrict uploads to PDF (and optionally images) via mime-type and size validation on the server, not just the client.

`lib/storage.ts` is built on the `cloudinary` SDK, configured with `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET`. It exposes `getUploadUrl()`, `getDownloadUrl()`, and `deleteFile()`. Nothing else in the app touches Cloudinary directly, so swapping providers later means rewriting only this one file.

---

## Routes and Panels

### Public
- `/` Full builder landing page: header nav with the portal login/signup links, hero, About the Project, Why Choose Us, Location, Contact, footer. All copy uses only the real project facts above (17-acre project, Surjani Sector 12 Karachi, 360 sold plots) plus generic placeholder content elsewhere — replace with real content/images when available, same spirit as the placeholder branding.
- `/login` Login, redirect by role and status.
- `/signup` Client signup with email, password, name, phone, CNIC, claimed plot number.

### Admin (ADMIN role only)
- `/admin/dashboard` Overview: total clients, total documents, recent uploads, and the **pending verification list** (top priority widget).
- `/admin/pending` Full list of PENDING signups, with a "link to plot" action.
- `/admin/clients` All clients, searchable by name, plot number, CNIC. TanStack Table with pagination. "Create new client" button for the admin-created-client flow (see Authentication and Linking Flow above).
- `/admin/clients/[id]` One client's profile, their plot, and all their documents. Upload new document here (title, category, file). Delete document. Edit client details.
- `/admin/plots` Plot list (R-01..R-322, L-01..L-37) with linked client status.

### Client (CLIENT role, ACTIVE status only)
- `/client/dashboard` Their plot info and a document count summary by category.
- `/client/documents` All their documents, filterable by category, each with view and download. Documents open via short-lived signed URLs only.
- `/client/profile` Their own details, read-only.
- If status is PENDING: show a verification-pending screen instead of documents.

Enforce role AND status checks in middleware and in every server action. Never trust the client. Every client-side query filters by the session user's own client id.

---

## Data Seeding

`prisma/seed.ts` inserts only permanent structural data:

- One admin user (email `admin@portal.com`, known dev password, hashed).
- The real plot scheme from the official member list: `R-01`..`R-322` and `L-01`..`L-37` (359 plots), all status SOLD except `R-248`, which is `CANCELLED`. Plots carry no size/block — those fields were removed. Re-running the seed deletes any unlinked plots (e.g. the old `P-001`..`P-360` placeholders) and recreates the canonical set; linked plots are left untouched.

Dummy clients, pending signups, and sample documents were used during Phases 3-5 to test the verification/upload/view flows end to end, then deliberately removed from both the database and `seed.ts` once real client onboarding began. Re-running the seed script must never recreate fake clients. Real clients are now added one at a time, either via self-signup + admin link, or via the admin-create-client flow.

---

## Data Integrity and Security Rules (Enforce Strictly)

1. One plot links to at most one client (`plotId` is unique on Client).
2. A client sees ONLY their own documents. Every client query filters by `clientId` derived from the session, never from a URL parameter.
3. PENDING users cannot access any documents.
4. Only ADMIN can upload, delete, or link.
5. Storage bucket is private; all access is through expiring signed URLs.
6. Validate file type and size on the server before saving the document row.
7. Log who uploaded each document (`uploadedBy`) and when.

---

## Build Order (Phases)

Verify each phase before the next.

1. **Setup**: Next.js, TypeScript, Prisma, a Postgres database (Supabase or Neon), a private Cloudinary account (raw resources), the `lib/storage.ts` wrapper, Tailwind, shadcn/ui, Auth.js. Define schema, first migration.
2. **Auth and roles**: admin login (seeded), client signup, login, role and status based redirects, middleware protection, pending-verification screen.
3. **Plots and clients**: seed the real plots (R-01..R-322, L-01..L-37), client management UI, the pending verification and link-to-plot flow.
4. **Document upload**: admin upload via signed direct-to-storage URLs, category and title, document list on client profile, delete.
5. **Client document view**: client documents page, category filter, view and download via short-lived signed URLs, strict ownership checks.
6. **Dashboard and search**: admin dashboard stats, pending widget, client search.
7. **Polish and deploy**: validation, error and empty states, then Vercel deploy.

---

## Deployment Notes

The system has three separate cloud pieces plus a domain. Keep them clearly separated.

```
App hosting    -> Vercel (Next.js runs here)
Database       -> Supabase or Neon (Postgres, cloud)
File storage   -> Cloudinary (private "raw" resources, cloud)
Domain         -> Hostinger (only the domain name)
```

- **Vercel (now)**: deploy the Next.js app. Set env vars: `DATABASE_URL` (Postgres), `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, and the Auth.js secrets. Run migrations on deploy.
- **Cloudinary**: create an account (no payment card required for the free tier — this is why it was chosen over Cloudflare R2, which requires one). Note the cloud name, API key, and API secret from the dashboard. All uploads/downloads/deletes go through `resource_type: "raw"` + `type: "private"`.
- **Database**: a free Postgres tier is enough since it only stores text. On Supabase free tier, be aware projects pause after a week of inactivity, so for the live client demo use a plan that stays awake, or use Neon.
- **Hostinger (later)**: buy ONLY the domain here. Do NOT use Hostinger shared hosting to run the Next.js app, it is built for PHP/WordPress and will not run this app properly. Point the Hostinger domain's DNS to Vercel. The app stays on Vercel, the database stays on its provider, and storage stays on Cloudinary. Nothing about the storage or database changes when the domain is added.

Keep all secrets in env vars, never hardcoded. Because all storage goes through `lib/storage.ts`, moving off Cloudinary later (if ever needed) means editing only that one file.

---

## Code Conventions

- Server Actions for all mutations. Storage signing in dedicated server-only functions.
- Zod validation for every form and action input.
- All storage access wrapped in `lib/storage.ts` for provider portability.
- Reusable components in `components/`, logic in `lib/`.
- Currency or sizes formatted cleanly; labels in clear English or Roman Urdu as suitable.
- File sizes shown human-readable (KB, MB).

---

## What NOT to Build Yet

- No installment or payment tracking (all plots are already sold and paid).
- No online payments.
- No client-side uploading (admin uploads only; client is view and download only).
- No SMS or email notifications yet (can add later for "new document uploaded" alerts).

Keep the code modular so these can be added later without restructuring.

---

## Claude CLI Setup (Agents, Skills, Commands)

This project has a project-level Claude Code setup so that patterns stay consistent, instructions aren't re-typed every session, and heavy or domain-specific work runs in a subagent's own context instead of bloating the main conversation.

**Subagents** (`.claude/agents/`):
- `db-architect` — Prisma schema, migrations, relations, indexes, seed data shape.
- `security-auditor` — audits auth, role/status checks, access control, and signed URL ownership checks. The strictest reviewer; read-only, reports findings.
- `storage-engineer` — Cloudinary integration, `lib/storage.ts`, signed upload/download URLs, direct-to-storage uploads.
- `ui-builder` — admin/client panel UI, shadcn/ui, Tailwind, TanStack Table; always reads branding from the central config.

**Skills** (`.claude/skills/`):
- `prisma-conventions` — schema naming, enum usage, relation rules matching this project's data model.
- `r2-storage-pattern` — exact signed upload / signed download flow (Cloudinary, private "raw" resources) and object key format. Name is historical, from when the project used Cloudflare R2.
- `access-control-rules` — session/role/status checks required everywhere; client data scoped by session-derived `clientId` only.
- `shadcn-admin-table` — reusable TanStack Table + shadcn/ui setup (search, pagination, filters) for admin list pages.
- `server-action-pattern` — the template every mutation follows: auth check, then Zod validation, then logic, then a consistent return shape.

**Slash commands** (`.claude/commands/`):
- `/new-feature` — start a new phase/feature: loads the relevant skill(s) first, then implements.
- `/audit-security` — runs `security-auditor` over the current feature's access control.
- `/add-page` — scaffolds a new admin or client page with auth guard, layout, and branding wired in.
- `/seed-update` — safely extends `prisma/seed.ts` with more dummy data.

**Rules:**
- When building a new feature, load the relevant skill(s) first and follow their patterns — don't improvise a different approach for something a skill already defines.
- When work is heavy or domain-specific (schema changes, storage/Cloudinary logic, UI/admin tables, or anything touching access control), hand it to the matching subagent instead of doing it inline, so the main conversation's context stays light.
