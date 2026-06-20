---
description: Safely add dummy data to prisma/seed.ts
argument-hint: [what to add, e.g. "5 more pending signups" or "documents for client P-010"]
---

Update `prisma/seed.ts` for the Client Document Vault and Portal project to add: $ARGUMENTS

Follow CLAUDE.md's "Dummy Data Seeding" section and the `prisma-conventions` skill:

- Plots are `P-001` through `P-360`, always status `SOLD`. Don't duplicate an existing `plotNumber`.
- Seeded admin stays `admin@portal.com` unless told otherwise.
- New dummy clients need a `User` (hashed password via `lib/password.ts`, status `ACTIVE` if linked, `PENDING` if simulating an unlinked signup) and a `Client` row with a unique `plotId`.
- Any new sample `Document` rows need a real small placeholder PDF actually uploaded to the R2 bucket via `lib/storage.ts` (not just a fake `fileKey`), so view/download works end to end — don't fabricate a `fileKey` that points at nothing.
- Keep the script written so it still scales to all 360 real clients later — don't add one-off logic that only makes sense for the current dummy subset.
- After editing, run the seed (`npx prisma db seed` or however it's wired) only if a real `DATABASE_URL` is configured; otherwise report the change and let the user run it.
