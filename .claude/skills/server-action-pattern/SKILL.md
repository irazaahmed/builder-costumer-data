---
name: server-action-pattern
description: Template for every mutation in this project — Zod validation on input, auth/role/status check first, then business logic, consistent error returns. Use when writing any new Server Action (uploads, linking, deletes, edits, signup, login).
---

# Server Action pattern

Every mutation in this project is a Server Action. Follow this order strictly — auth before validation, validation before business logic:

```ts
"use server";

import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const inputSchema = z.object({
  // define exactly the fields this action accepts
});

export async function actionName(input: z.infer<typeof inputSchema>) {
  // 1. Auth check first — before touching input or the database.
  const session = await auth();
  if (!session?.user) {
    return { error: "Not authenticated" };
  }
  if (session.user.role !== "ADMIN") {
    return { error: "Not authorized" };
  }

  // 2. Validate input with Zod — never trust the caller.
  const parsed = inputSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Invalid input", issues: parsed.error.flatten() };
  }

  // 3. Business logic. For anything client-scoped, derive the id from the
  // session, never from `parsed.data` — see the access-control-rules skill.
  try {
    // ...
    return { success: true /*, data */ };
  } catch (err) {
    console.error("actionName failed", err);
    return { error: "Something went wrong" };
  }
}
```

## Rules

- The auth/role/status check always comes first — don't validate input you're not authorized to act on.
- For `CLIENT`-scoped actions (e.g. requesting a document download URL), check `session.user.status === "ACTIVE"` in addition to role, and scope every query by `session.user.clientId` — never by an id passed in `input`.
- Return a consistent shape: `{ success: true, ... }` or `{ error: string, ... }`. Don't throw raw errors across the Server Action boundary — catch and translate them.
- Use Zod for every input, even simple ones (an id, a single string) — see CLAUDE.md's "Code Conventions" section.
- Keep storage calls (`lib/storage.ts`) and Prisma calls in the action itself or in a thin `lib/` helper it calls — don't reach for `@aws-sdk/*` directly from a Server Action (see the `r2-storage-pattern` skill).
