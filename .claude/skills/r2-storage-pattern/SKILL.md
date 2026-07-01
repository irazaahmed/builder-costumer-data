---
name: r2-storage-pattern
description: Exact pattern for signed direct-to-Cloudinary upload and signed download against the project's private "raw" Cloudinary storage. Use when writing or reviewing any file upload, download, or delete code, so files never pass through server memory and object keys follow the clients/{clientId}/{category}/{timestamp}-{filename} format.
---

# Storage pattern (Cloudinary)

> Historical name: this skill/folder is still called `r2-storage-pattern` from when the project used Cloudflare R2. The project now uses Cloudinary (R2 requires a payment card on file even on the free tier; Cloudinary doesn't). The pattern below is current.

All of this lives behind `lib/storage.ts`. Nothing else in the app imports the `cloudinary` package directly — see CLAUDE.md's "Most Important Architectural Rule" and "File Storage and Security" sections.

Every asset uses `resource_type: "raw"` (store PDFs/images verbatim, no Cloudinary image-transformation pipeline) and delivery `type: "private"` (not `"authenticated"` — token/cookie access control needs Cloudinary's paid Advanced plan; `"private"` still requires a valid signature + `expires_at` to fetch on the free plan).

## Object key format

```
clients/{clientId}/{category}/{timestamp}-{filename}
```

Built by `buildDocumentKey(clientId, category, fileName)` in `lib/storage.ts`. Always sanitize the filename (strip anything that isn't alphanumeric, `.`, `-`, or `_`) before using it in a key. This same string is the Cloudinary `public_id`.

## Upload flow (admin only)

1. Admin picks a client and a file in the UI (`react-dropzone`).
2. A Server Action validates the session: role must be `ADMIN`. Validate the file's declared mime type (PDF, optionally images) and size server-side — never trust client-side validation alone.
3. The action calls `getUploadUrl({ key, contentType })` from `lib/storage.ts`, which returns `{ url, fields, key }` — `fields` is the full set of signed params (`api_key`, `timestamp`, `signature`, `public_id`, `type`).
4. The browser builds a `FormData` (the file plus every entry in `fields`) and does a `POST` — not a PUT — directly to `url`. The file bytes never touch the Next.js server.
5. On successful upload (check both HTTP status and Cloudinary's JSON `error` field), the Server Action creates the `Document` row with the `fileKey`, `fileName`, `fileSize`, `mimeType`, and `uploadedBy`.

## Download/view flow (admin or owning client)

1. Caller requests to view/download a specific `Document` by id.
2. The Server Action re-checks ownership: for a `CLIENT` role, the document's `clientId` must equal the session's `clientId` — derived from the session, never a URL param. For `ADMIN`, no ownership restriction.
3. Call `getDownloadUrl(fileKey, options?)` to get a signed URL with `expires_at` 5-10 minutes out. Pass `{ download: true, fileName }` (fileName must include the real extension) to force a save-as via `attachment` + `target_filename` instead of inline viewing.
4. Return only the signed URL to the caller; never the raw key, and never a long-lived or public URL.

## Delete flow (admin only)

1. Validate `ADMIN` role.
2. Call `deleteFile(fileKey)` (`cloudinary.uploader.destroy` with `resource_type: "raw"`, `type: "private"`).
3. Delete the `Document` row in the same action (don't leave an orphaned DB row pointing at a deleted object, or an orphaned object with no DB row).

## Things to never do

- Never make an object `type: "upload"` (public) or `"authenticated"`, even "temporarily for testing." It must stay `"private"`.
- Never generate a signed download URL with a long `expires_at` "to be safe" — 5-10 minutes per CLAUDE.md.
- Never stream/buffer the file through a Next.js route handler or Server Action body — that's exactly what the signed direct-to-Cloudinary POST avoids.
- Don't try to give the signed *upload* a custom expiry — Cloudinary validates its own timestamp tolerance, it isn't a caller-configurable TTL like S3 presigned PUTs were.
