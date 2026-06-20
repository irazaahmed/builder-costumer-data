---
description: Start a new phase/feature with the right skill(s) loaded first
argument-hint: [feature description]
---

Implement the following feature for the Client Document Vault and Portal project: $ARGUMENTS

Before writing any code:

1. Re-read the relevant parts of the root `CLAUDE.md` for this feature (data model, routes, build order phase it belongs to).
2. Decide which of the project skills apply, and load them before coding: `prisma-conventions` (schema/migration touches), `r2-storage-pattern` (upload/download/delete logic), `access-control-rules` (any server action, route, or middleware), `shadcn-admin-table` (admin list/table pages), `server-action-pattern` (any mutation). Most non-trivial features need more than one.
3. If the work is primarily database, storage, UI, or security-sensitive, consider delegating it to the matching subagent (`db-architect`, `storage-engineer`, `ui-builder`, `security-auditor`) instead of doing it all in the main context — see the "Claude CLI Setup" section of `CLAUDE.md` for when to do that.
4. Implement following the loaded skills' patterns exactly, not ad hoc variations.
5. If the feature touches auth, roles, status, or document access, run `/audit-security` on it before considering it done.
