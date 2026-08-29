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
  const { fileName, contentType, kind } = req.body as PresignBody

  const ext = extensionFor(contentType, kind as UploadKind)
  if (!ext) {
    const label = UPLOAD_LIMITS[kind as UploadKind].label
    throw new AppError(`${label} must be a supported file type`, 400)
  }

  const key = buildKey(userId, kind, ext)
  const uploadUrl = await presignPut(key, contentType)
  const publicUrl = publicUrlFor(key)

  res.status(201).json({ uploadUrl, publicUrl, key })
}
