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
