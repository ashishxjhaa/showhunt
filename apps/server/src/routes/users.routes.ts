import { Router } from "express"
import { getPublicUser } from "../controllers/users.controllers"
import { optionalAuth } from "../middleware/auth.middleware"

export const usersRouter = Router()

usersRouter.get("/:username", optionalAuth, getPublicUser)
