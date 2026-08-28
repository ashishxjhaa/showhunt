import { Router } from "express"
import { me, signout } from "../controllers/auth.controllers"
import { authMiddleware } from "../middleware/auth.middleware"

export const authRouter = Router()

authRouter.post("/signout", signout)
authRouter.get("/me", authMiddleware, me)
