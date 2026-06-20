---
name: access-control-rules
description: Session, role, and status checks required in every server action, route, and middleware in this project. Use when writing or reviewing any code path that touches Client, Document, or Plot data — clients must only see their own data via session-derived clientId, never a URL or form parameter, and PENDING users must see nothing.
---

# Access control rules

This project stores real clients' legal documents (sale agreements, CNIC copies, payment/allotment papers). Every rule below comes from CLAUDE.md's "Authentication and Linking Flow" and "Data Integrity and Security Rules" sections — treat them as non-negotiable, not style preferences.

## The linking flow (why PENDING exists)

1. Clients self-signup with email/password/name/phone plus a *claim* (`claimedCnic` and/or `claimedPlotNumber`). This does not grant access to anything yet.
2. New accounts start as `UserStatus.PENDING` with no linked `Client`/`Plot`. In this state, the UI shows a "your account is under verification" screen — no document data, no plot data, nothing.
3. Only an `ADMIN` can match a pending signup to the correct `Plot`/`Client` record and flip status to `ACTIVE`. This link action must be logged (who linked, when).
4. Admin accounts are seeded, never self-signup.

## Required checks, every time

For **every** Server Action, Route Handler, and middleware entry that touches `User`, `Client`, `Plot`, or `Document`:

1. **Session check first.** No data access before confirming there's an authenticated session.
2. **Role check.** Mutations that are admin-only (upload, delete, edit client, link signup) must verify `session.user.role === "ADMIN"` before doing anything else.
3. **Status check.** A `CLIENT` session with `status !== "ACTIVE"` must never receive document or plot data — show the pending/blocked state instead.
4. **Ownership via session, never via input.** Any query scoped to "this client's data" must filter using `session.user.clientId` (or an id derived from it server-side). Never accept a `clientId` from a URL param, form field, or request body and trust it — a client could substitute another client's id.
5. **Re-check on every document access.** Don't rely on a check done earlier in the request lifecycle (e.g. at page load) to authorize a later action (e.g. requesting a presigned download URL) — re-verify ownership at the point of the sensitive operation.

## Server Action skeleton

See the `server-action-pattern` skill for the exact template (Zod validation, auth check ordering, error shape). The auth/role/status check always comes before Zod validation of business input, since there's no reason to validate input you're not even authorized to act on.

## Middleware

`middleware.ts` should redirect by role and status before a request reaches `/admin/*` or `/client/*` pages: unauthenticated → `/login`, wrong role → the other panel's root (or a 403), `CLIENT` with `PENDING`/`BLOCKED` status → the verification-pending screen instead of `/client/*` content.
