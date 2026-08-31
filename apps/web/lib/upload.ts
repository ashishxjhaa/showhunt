import { api } from '@/lib/api'

export const UPLOAD_LIMITS_MB = {
    logo: 5,
    photo: 5,
    video: 100,
} as const

export type UploadKind = keyof typeof UPLOAD_LIMITS_MB

const ALLOWED_IMAGE_TYPES = [
    'image/png',
    'image/jpeg',
    'image/webp',
    'image/svg+xml',
]

const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime']

export function validateFileType(file: File, kind: UploadKind): boolean {
    const allowed = kind === 'video' ? ALLOWED_VIDEO_TYPES : ALLOWED_IMAGE_TYPES
    return allowed.includes(file.type)
}

/**
 * Uploads a file straight to S3 via a presigned URL, so the file bytes
 * never pass through the API. Returns the public URL.
 */
export async function uploadFile(file: File, kind: UploadKind): Promise<string> {
    const res = await api.post<{ uploadUrl: string; publicUrl: string }>(
        '/api/v1/uploads/presign',
        { fileName: file.name, contentType: file.type, kind, fileSize: file.size }
    )

    const { uploadUrl, publicUrl } = res.data

    // axios throws on non-2xx responses, so no manual status check is needed.
    // The browser sets Content-Length from the File body to match the signed size.
    await api.put(uploadUrl, file, {
        headers: { 'Content-Type': file.type },
    })

    return publicUrl
}
