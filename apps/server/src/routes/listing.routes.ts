import { Router } from "express"
import {
  createListing,
  deleteListing,
  enrichListing,
  getListings,
  getMyListings,
  getTags,
  toggleUpvote,
  updateListing,
} from "../controllers/listing.controllers"
import { authMiddleware } from "../middleware/auth.middleware"
import { validate } from "../middleware/validate.middleware"
import {
  createListingSchema,
  enrichSchema,
  updateListingSchema,
} from "../lib/schema"

export const listingRouter = Router()

listingRouter.get("/", getListings)
listingRouter.get("/tags", getTags)
listingRouter.get("/mine", authMiddleware, getMyListings)
listingRouter.post("/", authMiddleware, validate(createListingSchema), createListing)
listingRouter.post("/enrich", authMiddleware, validate(enrichSchema), enrichListing)
listingRouter.patch("/:id", authMiddleware, validate(updateListingSchema), updateListing)
listingRouter.delete("/:id", authMiddleware, deleteListing)
listingRouter.post("/:id/upvote", authMiddleware, toggleUpvote)

