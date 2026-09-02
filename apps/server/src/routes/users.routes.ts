import { Router } from "express"
import { getBuildersMap, getPublicUser } from "../controllers/users.controllers"
import { optionalAuth } from "../middleware/auth.middleware"

export const usersRouter = Router()

usersRouter.get("/map", getBuildersMap)
usersRouter.get("/:username", optionalAuth, getPublicUser)
