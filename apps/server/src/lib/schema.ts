import { z } from "zod"

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

export const createListingSchema = z.object({
  name: z.string().min(2, "Name is too short").max(80),
  description: z.string().min(1, "Description is required").max(160),
  link: z.string().url("Invalid link"),
  logoUrl: z.string().min(1, "Logo is required"),
  tags: z.array(z.string().min(1)).min(1, "Pick at least one tag").max(3, "Pick at most 3 tags"),
})
