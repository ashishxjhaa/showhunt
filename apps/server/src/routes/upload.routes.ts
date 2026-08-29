import { Router } from "express"
import { createPresignedUpload } from "../controllers/upload.controllers"
import { authMiddleware } from "../middleware/auth.middleware"
import { validate } from "../middleware/validate.middleware"
import { presignSchema } from "../lib/schema"

export const uploadRouter = Router()

uploadRouter.post("/presign", authMiddleware, validate(presignSchema), createPresignedUpload)
