import { Router } from "express"
import {
  createComment,
  createListing,
  deleteListing,
  enrichListing,
  getComments,
  getListing,
  getListings,
  getMyListings,
  getSimilarListings,
  getTags,
  toggleUpvote,
  updateListing,
} from "../controllers/listing.controllers"
import { authMiddleware, optionalAuth } from "../middleware/auth.middleware"
import { validate } from "../middleware/validate.middleware"
import {
  createCommentSchema,
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
listingRouter.get("/:id", optionalAuth, getListing)
listingRouter.get("/:id/similar", getSimilarListings)
listingRouter.patch("/:id", authMiddleware, validate(updateListingSchema), updateListing)
listingRouter.delete("/:id", authMiddleware, deleteListing)
listingRouter.post("/:id/upvote", authMiddleware, toggleUpvote)
listingRouter.get("/:id/comments", getComments)
listingRouter.post("/:id/comments", authMiddleware, validate(createCommentSchema), createComment)
