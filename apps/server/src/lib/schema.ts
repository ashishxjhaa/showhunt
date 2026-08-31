import { z } from "zod"
import { isCuratedTag } from "./tags"

export const signupSchema = z.object({
  fullName: z.string().min(2, "Name is too short").max(80),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters").max(72),
})

export const signinSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
})

export const googleSchema = z.object({
  credential: z.string().min(10, "Missing Google credential"),
})

const tagsField = z
  .array(z.string().min(1))
  .min(1, "Pick at least one tag")
  .max(3, "Pick at most 3 tags")
  .refine((tags) => tags.every(isCuratedTag), "Unknown tag")

const socialLinksField = z
  .array(
    z.object({
      platform: z.enum([
        "GITHUB",
        "PLAY_STORE",
        "APP_STORE",
        "X_TWITTER",
        "PRODUCT_HUNT",
        "YOUTUBE",
        "OTHER",
      ]),
      url: z.string().url("Invalid link"),
    })
  )
  .max(6, "Up to 6 extra links")
  .optional()

export const createListingSchema = z.object({
  name: z.string().min(2, "Name is too short").max(80),
  description: z.string().min(1, "Description is required").max(160),
  link: z.string().url("Invalid link"),
  logoUrl: z.string().min(1, "Logo is required"),
  videoUrl: z.string().url("Invalid video URL").nullish(),
  photos: z.array(z.string().min(1)).max(5, "Up to 5 photos").optional(),
  tags: tagsField,
  isOpenSource: z.boolean().optional(),
  repoUrl: z.string().url("Invalid repo URL").nullish(),
  socialLinks: socialLinksField,
})

export const updateListingSchema = createListingSchema
  .extend({
    link: z.string().url("Invalid link").optional(),
    logoUrl: z.string().min(1, "Logo is required").optional(),
    videoUrl: z.string().url("Invalid video URL").nullable().optional(),
    photos: z.array(z.string().min(1)).max(5, "Up to 5 photos").optional(),
  })
  .omit({ name: true, description: true, tags: true })
  .extend({
    name: z.string().min(2, "Name is too short").max(80).optional(),
    description: z.string().min(1, "Description is required").max(160).optional(),
    tags: tagsField.optional(),
  })

export const enrichSchema = z.object({
  url: z.string().url("Invalid URL"),
})

export const presignSchema = z.object({
  fileName: z.string().min(1, "File name is required").max(255),
  contentType: z.string().min(1, "Content type is required").max(100),
  kind: z.enum(["logo", "photo", "video"]),
})

export const updateAvatarSchema = z.object({
  avatarUrl: z.string().regex(/^\/avatars\/avatar-\d{2}\.jpg$/, "Invalid avatar").max(512),
})

export const createCommentSchema = z.object({
  content: z.string().trim().min(1, "Comment cannot be empty").max(500, "Comment is too long"),
})

export type PresignBody = z.infer<typeof presignSchema>
export type CreateListingBody = z.infer<typeof createListingSchema>
export type UpdateListingBody = z.infer<typeof updateListingSchema>
export type CreateCommentBody = z.infer<typeof createCommentSchema>

