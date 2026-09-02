import type { Request, Response } from "express"
import { AppError } from "../lib/errors"
import {
  buildKey,
  extensionFor,
  presignPut,
  publicUrlFor,
  UPLOAD_LIMITS,
  type UploadKind,
} from "../lib/s3"
import type { PresignBody } from "../lib/schema"

export async function createPresignedUpload(req: Request, res: Response) {
  const userId = req.userId!
  const { contentType, kind, fileSize } = req.body as PresignBody
  const limits = UPLOAD_LIMITS[kind as UploadKind]

  const ext = extensionFor(contentType, kind as UploadKind)
  if (!ext) {
    throw new AppError(`${limits.label} must be a supported file type`, 400)
  }

  if (limits.maxBytes != null && fileSize > limits.maxBytes) {
    const maxMb = Math.round(limits.maxBytes / (1024 * 1024))
    throw new AppError(`${limits.label} must be under ${maxMb}MB`, 400)
  }

  const key = buildKey(userId, kind, ext)
  const uploadUrl = await presignPut(
    key,
    contentType,
    fileSize,
    kind === "video" ? 3600 : 600
  )
  const publicUrl = publicUrlFor(key)

  res.status(201).json({ uploadUrl, publicUrl, key })
}
