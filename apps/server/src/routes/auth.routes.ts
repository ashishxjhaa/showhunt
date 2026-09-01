import { Router } from "express"
import {
  google,
  me,
  getMyActivity,
  signin,
  signout,
  signup,
  updateAvatar,
} from "../controllers/auth.controllers"
import { authMiddleware } from "../middleware/auth.middleware"
import { validate } from "../middleware/validate.middleware"
import { googleSchema, signinSchema, signupSchema, updateAvatarSchema } from "../lib/schema"

export const authRouter = Router()

authRouter.post("/signup", validate(signupSchema), signup)
authRouter.post("/signin", validate(signinSchema), signin)
authRouter.post("/google", validate(googleSchema), google)
authRouter.post("/signout", signout)
authRouter.get("/me", authMiddleware, me)
authRouter.get("/activity", authMiddleware, getMyActivity)
authRouter.patch("/avatar", authMiddleware, validate(updateAvatarSchema), updateAvatar)
