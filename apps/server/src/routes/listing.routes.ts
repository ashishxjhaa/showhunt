import { Router } from "express"
import {
  createListing,
  getListings,
  getMyListings,
  toggleUpvote,
} from "../controllers/listing.controllers"
import { authMiddleware } from "../middleware/auth.middleware"
import { validate } from "../middleware/validate.middleware"
import { createListingSchema } from "../lib/schema"

export const listingRouter = Router()

listingRouter.get("/", getListings)
listingRouter.post("/", authMiddleware, validate(createListingSchema), createListing)
listingRouter.get("/mine", authMiddleware, getMyListings)
listingRouter.post("/:id/upvote", authMiddleware, toggleUpvote)
