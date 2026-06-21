import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Single point of contact with Cloudflare R2. Nothing else in the app may
// import @aws-sdk/* directly — this keeps the storage provider swappable.

const r2Client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
  // The SDK's default ("WHEN_SUPPORTED") bakes a CRC32 checksum requirement
  // into presigned PutObject URLs before the file body is known, which then
  // fails signature validation when the browser PUTs the real file directly
  // to R2. "WHEN_REQUIRED" only attaches checksums when the operation
  // mandates one, which plain PutObject does not.
  requestChecksumCalculation: "WHEN_REQUIRED",
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME!;

const UPLOAD_URL_TTL_SECONDS = 300; // 5 minutes
const DOWNLOAD_URL_TTL_SECONDS = 600; // 10 minutes

interface GetUploadUrlParams {
  key: string;
  contentType: string;
}

/** Presigned PUT URL the browser uploads the file directly to. */
export async function getUploadUrl({ key, contentType }: GetUploadUrlParams) {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  });

  const url = await getSignedUrl(r2Client, command, {
    expiresIn: UPLOAD_URL_TTL_SECONDS,
  });

  return { url, key };
}

/** Short-lived presigned GET URL for viewing/downloading a document. */
export async function getDownloadUrl(key: string) {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  return getSignedUrl(r2Client, command, {
    expiresIn: DOWNLOAD_URL_TTL_SECONDS,
  });
}

export async function deleteFile(key: string) {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  await r2Client.send(command);
}

/** Builds the R2 object key for a client document upload. */
export function buildDocumentKey(
  clientId: string,
  category: string,
  fileName: string
) {
  const timestamp = Date.now();
  const safeFileName = fileName.replace(/[^a-zA-Z0-9.\-_]/g, "_");
  return `clients/${clientId}/${category}/${timestamp}-${safeFileName}`;
}
