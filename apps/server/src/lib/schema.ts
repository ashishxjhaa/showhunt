import { z } from "zod"
import { isIndiaStateSlug } from "./india-states"
import { MAX_TECH_STACK, MAX_TECH_STACK_ITEM } from "./tech-stack"
import { isCuratedTag } from "./tags"
import { isReservedUsername, USERNAME_PATTERN } from "./username"

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
  .refine(
    (links) => new Set(links.map((l) => l.platform)).size === links.length,
    "Each platform can only be used once"
  )
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
  fileSize: z.number().int().positive("File size is required"),
})

export const AVATAR_SEEDS = [
  "ember",
  "volt",
  "neon",
  "pulse",
  "spark",
  "flare",
  "bolt",
  "prism",
  "flux",
  "glow",
  "arc",
  "beam",
  "nova",
  "ion",
  "quark",
  "plasma",
  "zenith",
  "orbit",
  "comet",
  "radar",
] as const

export const updateAvatarSchema = z.object({
  avatarUrl: z
    .string()
    .regex(
      /^gaze:(ember|volt|neon|pulse|spark|flare|bolt|prism|flux|glow|arc|beam|nova|ion|quark|plasma|zenith|orbit|comet|radar)$/,
      "Invalid avatar"
    )
    .max(64),
})

/** Deterministic default Gaze avatar id for a new user. */
export function defaultAvatarIdFor(seed: string): string {
  let hash = 0
  for (const ch of seed) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0
  return `gaze:${AVATAR_SEEDS[hash % AVATAR_SEEDS.length]}`
}

export const createCommentSchema = z.object({
  content: z.string().trim().min(1, "Comment cannot be empty").max(500, "Comment is too long"),
})

const optionalProfileUrl = (message: string) =>
  z
    .string()
    .trim()
    .transform((value) => (value === "" ? null : value))
    .pipe(z.string().url(message).nullable())

export const publicProfileSchema = z.object({
  username: z
    .string()
    .trim()
    .toLowerCase()
    .regex(USERNAME_PATTERN, "Username must be 3–20 characters: lowercase letters, numbers, underscores")
    .refine((value) => !isReservedUsername(value), "This username is reserved"),
  bio: z.string().trim().min(1, "Bio is required").max(280, "Bio is too long"),
  twitterUrl: optionalProfileUrl("Invalid Twitter link"),
  githubUrl: optionalProfileUrl("Invalid GitHub link"),
  portfolioUrl: optionalProfileUrl("Invalid portfolio link"),
  linkedinUrl: optionalProfileUrl("Invalid LinkedIn link"),
  state: z
    .string()
    .min(1, "State is required")
    .refine(isIndiaStateSlug, "Pick a valid Indian state or union territory"),
  techStack: z
    .array(
      z
        .string()
        .trim()
        .min(1, "Tech stack item is empty")
        .max(MAX_TECH_STACK_ITEM, "Tech stack item is too long")
    )
    .min(1, "Pick at least one tech")
    .max(MAX_TECH_STACK, `Pick at most ${MAX_TECH_STACK} techs`)
    .refine(
      (items) => new Set(items.map((item) => item.toLowerCase())).size === items.length,
      "Duplicate tech stack items"
    ),
})

export type PresignBody = z.infer<typeof presignSchema>
export type CreateListingBody = z.infer<typeof createListingSchema>
export type UpdateListingBody = z.infer<typeof updateListingSchema>
export type CreateCommentBody = z.infer<typeof createCommentSchema>
export type PublicProfileBody = z.infer<typeof publicProfileSchema>

