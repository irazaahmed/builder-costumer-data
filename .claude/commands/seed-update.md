---
description: Safely update prisma/seed.ts (structural data only — admin and plots)
argument-hint: [what to change, e.g. "add a 5th block" or "fix plot sizes for block C"]
---

Update `prisma/seed.ts` for the Client Document Vault and Portal project to: $ARGUMENTS

`prisma/seed.ts` now seeds only permanent structural data (the admin user and the 360 plots) — see CLAUDE.md's "Data Seeding" section. Dummy clients, pending signups, and sample documents were removed once real client onboarding began; **do not reintroduce them here**. Real clients are added one at a time through the app itself (self-signup + admin link, or the admin-create-client flow), never through this script.

Follow the `prisma-conventions` skill:

- Plots are `P-001` through `P-360`, always status `SOLD`. Don't duplicate an existing `plotNumber`.
- Seeded admin stays `admin@portal.com` unless told otherwise.
- After editing, run the seed (`npx prisma db seed` or however it's wired) only if a real `DATABASE_URL` is configured and the user has confirmed it's safe to run against that database; otherwise report the change and let the user run it.
