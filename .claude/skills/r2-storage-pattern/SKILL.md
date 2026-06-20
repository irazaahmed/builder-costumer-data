---
name: r2-storage-pattern
description: Exact pattern for presigned PUT upload and presigned GET download against the project's private Cloudflare R2 bucket. Use when writing or reviewing any file upload, download, or delete code, so files never pass through server memory and object keys follow the clients/{clientId}/{category}/{timestamp}-{filename} format.
---

# R2 storage pattern

All of this lives behind `lib/storage.ts`. Nothing else in the app imports `@aws-sdk/client-s3` or `@aws-sdk/s3-request-presigner` directly — see CLAUDE.md's "Most Important Architectural Rule" and "File Storage and Security" sections.

## Object key format

```
clients/{clientId}/{category}/{timestamp}-{filename}
```

Built by `buildDocumentKey(clientId, category, fileName)` in `lib/storage.ts`. Always sanitize the filename (strip anything that isn't alphanumeric, `.`, `-`, or `_`) before using it in a key.

## Upload flow (admin only)

1. Admin picks a client and a file in the UI (`react-dropzone`).
2. A Server Action validates the session: role must be `ADMIN`. Validate the file's declared mime type (PDF, optionally images) and size server-side — never trust client-side validation alone.
3. The action calls `getUploadUrl({ key, contentType })` from `lib/storage.ts` to get a presigned PUT URL.
4. The browser uploads the file **directly to R2** using that URL — the file bytes never touch the Next.js server.
5. On successful upload, the Server Action (or a follow-up one, triggered from the client after the PUT succeeds) creates the `Document` row with the `fileKey`, `fileName`, `fileSize`, `mimeType`, and `uploadedBy`.

## Download/view flow (admin or owning client)

1. Caller requests to view/download a specific `Document` by id.
2. The Server Action re-checks ownership: for a `CLIENT` role, the document's `clientId` must equal the session's `clientId` — derived from the session, never a URL param. For `ADMIN`, no ownership restriction.
3. Call `getDownloadUrl(fileKey)` to get a short-lived presigned GET URL (5-10 minutes).
4. Return only the presigned URL to the client; never the raw key, and never a long-lived or public URL.

## Delete flow (admin only)

1. Validate `ADMIN` role.
2. Call `deleteFile(fileKey)`.
3. Delete the `Document` row in the same action (don't leave an orphaned DB row pointing at a deleted object, or an orphaned object with no DB row).

## Things to never do

- Never make the bucket or an individual object public, even "temporarily for testing."
- Never generate a presigned URL with a long expiry "to be safe" — 5-10 minutes per CLAUDE.md.
- Never stream/buffer the file through a Next.js route handler or Server Action body — that's exactly what presigned PUT avoids.
