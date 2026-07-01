# Lodhi Brothers Housing Society — Client Document Vault and Portal

A secure document management portal for a real estate builder (17-acre project, Surjani Sector 12, Karachi, 359 plots). Admin uploads each client's legal documents as PDFs; each client logs in and sees only their own. See `CLAUDE.md` for the full architecture, data model, and build rules.

## Stack

- Next.js 15/16 (App Router, Server Actions) + TypeScript
- PostgreSQL (Supabase) via Prisma ORM
- Cloudinary (private `raw` resources) for PDF storage — signed direct uploads/downloads, never through the app server, never public
- Auth.js (NextAuth v5) for role-based auth (`ADMIN` / `CLIENT`)
- Tailwind CSS + shadcn/ui, TanStack Table, react-dropzone, Zod

## Getting Started

1. Copy `.env.example` to `.env` and fill in real values (Supabase connection strings, Cloudinary credentials, `AUTH_SECRET`).
2. Install dependencies and generate the Prisma client:
   ```bash
   npm install
   npx prisma generate
   ```
3. Apply migrations and seed the admin user + plot scheme:
   ```bash
   npx prisma migrate deploy
   npx prisma db seed
   ```
4. Run the dev server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000). Seeded admin login: `admin@portal.com` / `Admin123!` (change this immediately on any real deployment, via Settings → Change Password).

## Project docs

- `CLAUDE.md` — architecture, data model, security rules, build order (source of truth for how this app is built)
- `HANDOVER-CHECKLIST.md` — steps to move the app, database, and storage to a client's own accounts
- `PROJECT-SUMMARY.md` — plain-language project overview for non-technical stakeholders

## Deploy

Deployed on Vercel, connected to this repo's `main` branch. Set the environment variables from `.env.example` in the Vercel project settings before deploying.
