import { randomUUID } from "crypto"
import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { AppError } from "./errors"

const BUCKET = process.env.S3_BUCKET_NAME ?? ""
const REGION = process.env.AWS_REGION ?? "ap-south-1"

export const s3Client = new S3Client({ region: REGION })

export const UPLOAD_LIMITS = {
  logo: { label: "Logo", maxBytes: 5 * 1024 * 1024 },
  photo: { label: "Photo", maxBytes: 5 * 1024 * 1024 },
  video: { label: "Video", maxBytes: 100 * 1024 * 1024 },
} as const

export type UploadKind = keyof typeof UPLOAD_LIMITS

export const IMAGE_TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/svg+xml": "svg",
}

const VIDEO_TYPES: Record<string, string> = {
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
}

export function extensionFor(contentType: string, kind: UploadKind): string | null {
  const allowed = kind === "video" ? VIDEO_TYPES : IMAGE_TYPES
  return allowed[contentType] ?? null
}

export function buildKey(userId: string, kind: UploadKind, ext: string): string {
  return `uploads/${userId}/${kind}-${randomUUID()}.${ext}`
}

export async function presignPut(key: string, contentType: string): Promise<string> {
  if (!BUCKET) throw new AppError("S3 is not configured", 500)
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
  })
  return getSignedUrl(s3Client, command, { expiresIn: 600 })
}

export function publicUrlFor(key: string): string {
  // Path-style URL: dots in the bucket name break TLS on virtual-hosted URLs
  return `https://s3.${REGION}.amazonaws.com/${BUCKET}/${key}`
}

export async function deleteObject(key: string): Promise<void> {
  if (!BUCKET) throw new AppError("S3 is not configured", 500)
  await s3Client.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }))
}

/** Uploads an in-memory buffer to S3. */
export async function uploadBuffer(
  key: string,
  contentType: string,
  buffer: Buffer
): Promise<string> {
  if (!BUCKET) throw new AppError("S3 is not configured", 500)
  await s3Client.send(
    new PutObjectCommand({ Bucket: BUCKET, Key: key, ContentType: contentType, Body: buffer })
  )
  return publicUrlFor(key)
}

