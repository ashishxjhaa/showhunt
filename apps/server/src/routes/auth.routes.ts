import { Router } from "express"
import {
  google,
  me,
  signin,
  signout,
  signup,
} from "../controllers/auth.controllers"
import { authMiddleware } from "../middleware/auth.middleware"
import { validate } from "../middleware/validate.middleware"
import { googleSchema, signinSchema, signupSchema } from "../lib/schema"

export const authRouter = Router()

authRouter.post("/signup", validate(signupSchema), signup)
authRouter.post("/signin", validate(signinSchema), signin)
authRouter.post("/google", validate(googleSchema), google)
authRouter.post("/signout", signout)
authRouter.get("/me", authMiddleware, me)
