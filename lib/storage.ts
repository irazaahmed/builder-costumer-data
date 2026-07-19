import { v2 as cloudinary } from "cloudinary";

// Single point of contact with Cloudinary. Nothing else in the app may
// import the `cloudinary` package directly — this keeps the storage
// provider swappable.
//
// Why Cloudinary instead of Cloudflare R2: Cloudflare requires a card on
// file to enable R2 even on the free tier, which isn't available right now.
// Cloudinary's free tier needs no card. Files (PDFs/images) are stored as
// `resource_type: "raw"` so Cloudinary's image transformation pipeline never
// touches them — we want the bytes stored and returned verbatim.
//
// Delivery type is `"private"`, not `"authenticated"`: token/cookie-based
// access control (`"authenticated"`) requires Cloudinary's paid Advanced
// plan. `"private"` works on the free plan and still requires a validly
// signed URL (signature + expires_at) to fetch the asset — the bucket-level
// privacy guarantee we need.

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const RESOURCE_TYPE = "raw";
const DELIVERY_TYPE = "private";

const UPLOAD_URL_TTL_SECONDS = 300; // 5 minutes
const DOWNLOAD_URL_TTL_SECONDS = 600; // 10 minutes

interface GetUploadUrlParams {
  key: string;
  contentType: string;
}

interface UploadUrlResult {
  url: string;
  fields: Record<string, string>;
  key: string;
}

/**
 * Signed direct-upload target for the browser to POST the file to.
 *
 * Unlike S3, Cloudinary doesn't support a presigned PUT — the browser must
 * POST a multipart/form-data body (the file plus these signed `fields`) to
 * `url`. `contentType` isn't part of the signed payload (Cloudinary reads
 * the content type off the uploaded blob itself); it's kept as a parameter
 * only so the caller's shape doesn't change.
 *
 * Note on the 300s "TTL": Cloudinary doesn't let a signer set a custom
 * expiry for a signed upload the way S3 presigned URLs do. The `timestamp`
 * here is stamped at generation time, and Cloudinary rejects requests whose
 * timestamp is too far in the past using its own (not caller-configurable)
 * tolerance window. UPLOAD_URL_TTL_SECONDS is kept only as documentation of
 * intent/parity with the previous R2 behavior — it does not enforce
 * anything here.
 */
export async function getUploadUrl({
  key,
}: GetUploadUrlParams): Promise<UploadUrlResult> {
  void UPLOAD_URL_TTL_SECONDS;

  const timestamp = Math.floor(Date.now() / 1000);
  const paramsToSign = {
    timestamp,
    public_id: key,
    type: DELIVERY_TYPE,
  };

  const signed = cloudinary.utils.sign_request(paramsToSign, {});

  const url = `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/${RESOURCE_TYPE}/upload`;

  return {
    url,
    fields: {
      api_key: String(signed.api_key),
      timestamp: String(signed.timestamp),
      signature: String(signed.signature),
      public_id: String(signed.public_id),
      type: String(signed.type),
    },
    key,
  };
}

interface GetDownloadUrlOptions {
  download?: boolean;
  fileName?: string;
}

/**
 * Short-lived signed URL for viewing/downloading a document.
 *
 * By default the URL is for inline viewing. Pass `{ download: true,
 * fileName }` to force a save-as with that filename via
 * `attachment` + `target_filename` (mirrors the old
 * Content-Disposition: attachment behavior). `fileName` must include the
 * real file extension (it always does here — it's `Document.fileName`,
 * matching the stored object) or Cloudinary will append the asset's real
 * extension to avoid an extension mismatch.
 */
export async function getDownloadUrl(
  key: string,
  options?: GetDownloadUrlOptions
): Promise<string> {
  const expiresAt =
    Math.floor(Date.now() / 1000) + DOWNLOAD_URL_TTL_SECONDS;

  const forceDownload = Boolean(options?.download && options?.fileName);

  const paramsToSign = {
    timestamp: Math.floor(Date.now() / 1000),
    public_id: key,
    format: "",
    type: DELIVERY_TYPE,
    expires_at: expiresAt,
    ...(forceDownload
      ? { attachment: true, target_filename: options!.fileName }
      : {}),
  };

  const signed = cloudinary.utils.sign_request(paramsToSign, {});

  const query = new URLSearchParams(
    Object.entries(signed).map(([field, value]) => [field, String(value)])
  ).toString();

  const base = cloudinary.utils.api_url("download", {
    resource_type: RESOURCE_TYPE,
  });

  return `${base}?${query}`;
}

export async function deleteFile(key: string): Promise<void> {
  await cloudinary.uploader.destroy(key, {
    resource_type: RESOURCE_TYPE,
    type: DELIVERY_TYPE,
    invalidate: true,
  });
}

/** Builds the Cloudinary public_id (and R2-era-compatible key) for a client document upload. */
export function buildDocumentKey(
  clientId: string,
  category: string,
  fileName: string
) {
  const timestamp = Date.now();
  const safeFileName = fileName.replace(/[^a-zA-Z0-9.\-_]/g, "_");
  return `clients/${clientId}/${category}/${timestamp}-${safeFileName}`;
}

/**
 * Builds the Cloudinary public_id for a broadcast notification's optional
 * attachment. Not scoped to any client — a notification is visible to every
 * active client, unlike a Document.
 */
export function buildNotificationKey(fileName: string) {
  const timestamp = Date.now();
  const safeFileName = fileName.replace(/[^a-zA-Z0-9.\-_]/g, "_");
  return `notifications/${timestamp}-${safeFileName}`;
}

// ---------------------------------------------------------------------------
// Gallery media (homepage photo/video gallery)
//
// Deliberately a different security model from documents/notifications
// above: gallery photos and videos are public marketing content — today
// they're literally public static files under `public/gallery/`, served to
// every anonymous visitor with zero access control. Storing them in
// Cloudinary as delivery `type: "upload"` (public) with `resource_type:
// "image" | "video"` is not a security regression versus current behavior,
// and it lets the public site (and any CDN in front of it) cache the asset
// URLs directly instead of re-signing on every render. This is strictly
// additive: RESOURCE_TYPE/DELIVERY_TYPE and every helper above stay private
// raw, unchanged, for Document/Notification.

const GALLERY_DELIVERY_TYPE = "upload";

/**
 * Builds the Cloudinary public_id for a gallery upload — deliberately
 * WITHOUT the file extension. Unlike `resource_type: "raw"` (documents),
 * Cloudinary always appends `.{detected-format}` itself when building the
 * delivery URL for `resource_type: "image" | "video"`, regardless of what
 * text is already in the public_id. Keeping the extension out of the key
 * avoids a double-extension delivery URL (e.g. `photo.jpeg.jpg`) — see
 * `getGallerySecureUrl`, which appends the real detected format instead.
 */
export function buildGalleryKey(folderSlug: string, fileName: string) {
  const timestamp = Date.now();
  const dotIndex = fileName.lastIndexOf(".");
  const baseName = dotIndex > 0 ? fileName.slice(0, dotIndex) : fileName;
  const safeBaseName = baseName.replace(/[^a-zA-Z0-9.\-_]/g, "_");
  return `gallery/${folderSlug}/${timestamp}-${safeBaseName}`;
}

interface GetGalleryUploadUrlParams {
  key: string;
  resourceType: "image" | "video";
}

/**
 * Signed direct-upload target for a gallery image/video, mirroring
 * `getUploadUrl` above but for public `resource_type: "image" | "video"`
 * assets instead of private raw documents. The browser still POSTs a
 * `FormData` (the file plus every entry in `fields`) directly to `url` — the
 * file never passes through a Next.js server action or route handler.
 */
export async function getGalleryUploadUrl({
  key,
  resourceType,
}: GetGalleryUploadUrlParams): Promise<UploadUrlResult> {
  const timestamp = Math.floor(Date.now() / 1000);
  const paramsToSign = {
    timestamp,
    public_id: key,
    type: GALLERY_DELIVERY_TYPE,
  };

  const signed = cloudinary.utils.sign_request(paramsToSign, {});

  const url = `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`;

  return {
    url,
    fields: {
      api_key: String(signed.api_key),
      timestamp: String(signed.timestamp),
      signature: String(signed.signature),
      public_id: String(signed.public_id),
      type: String(signed.type),
    },
    key,
  };
}

/**
 * Deterministic public delivery URL for a gallery asset. Unlike
 * `getDownloadUrl`, this needs no signature or `expires_at` — the asset is
 * public (`type: "upload"`), so this URL can be derived any time, safely
 * cached by the browser/CDN.
 *
 * `format` (e.g. "jpg", "mp4") is required: for `resource_type: "image" |
 * "video"`, Cloudinary always appends `.{format}` to build the real
 * delivery URL, regardless of what's in `key` — omitting it 404s. `format`
 * is whatever Cloudinary detected at upload time (see `GalleryItem.format`),
 * which doesn't always match the original file extension verbatim (e.g.
 * `.jpeg` uploads are detected as format `jpg`).
 */
export function getGallerySecureUrl(
  key: string,
  resourceType: "image" | "video",
  format: string
): string {
  return `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/${resourceType}/upload/${key}.${format}`;
}

/** Deletes a gallery image/video from Cloudinary. Admin-only, caller's responsibility. */
export async function deleteGalleryFile(
  key: string,
  resourceType: "image" | "video"
): Promise<void> {
  await cloudinary.uploader.destroy(key, {
    resource_type: resourceType,
    type: GALLERY_DELIVERY_TYPE,
    invalidate: true,
  });
}

/**
 * Server-side upload straight from a local file path, bypassing the signed
 * direct-to-Cloudinary POST flow that `getGalleryUploadUrl` sets up for the
 * browser. Only for one-time server-side tooling (e.g. the
 * prisma/scripts/migrate-gallery-to-cloudinary.ts backfill) — regular admin
 * uploads from the UI must keep using the browser POST flow so file bytes
 * never pass through the Next.js server.
 */
export async function uploadGalleryFileFromDisk(
  filePath: string,
  key: string,
  resourceType: "image" | "video"
): Promise<{ format: string }> {
  const result = await cloudinary.uploader.upload(filePath, {
    public_id: key,
    resource_type: resourceType,
    type: GALLERY_DELIVERY_TYPE,
  });
  return { format: result.format };
}
