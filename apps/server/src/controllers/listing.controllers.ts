import type { Request, Response } from "express"
import { prisma } from "../lib/prisma"
import { AppError } from "../lib/errors"
import type { Prisma } from "../generated/prisma/client"

function serializeListing(
  listing: Prisma.ListingGetPayload<{
    include: { user: { select: { fullName: true } }; upvotes: { select: { userId: true } }; links: true }
  }>
) {
  return {
    id: listing.id,
    name: listing.name,
    description: listing.description,
    logoUrl: listing.logoUrl,
    isOpenSource: listing.isOpenSource,
    repoUrl: listing.repoUrl,
    tags: listing.tags,
    upvotes: listing.upvoteCount,
    hasUpvoted: listing.upvotes.length > 0,
    links: listing.links.map((l) => ({ platform: l.platform, url: l.url })),
    user: { fullName: listing.user.fullName },
    createdAt: listing.createdAt,
  }
}

const listingInclude = {
  user: { select: { fullName: true } },
  upvotes: { select: { userId: true } },
  links: true,
} as const

export async function getListings(req: Request, res: Response) {
  const listings = await prisma.listing.findMany({
    include: {
      ...listingInclude,
      upvotes: { where: { userId: req.userId }, select: { userId: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  res.json({ listings: listings.map(serializeListing) })
}

export async function getMyListings(req: Request, res: Response) {
  const listings = await prisma.listing.findMany({
    where: { userId: req.userId },
    include: listingInclude,
    orderBy: { createdAt: "desc" },
  })

  res.json({ listings: listings.map(serializeListing) })
}

export async function createListing(req: Request, res: Response) {
  const { name, description, link, logoUrl, tags } = req.body

  const listing = await prisma.listing.create({
    data: {
      name,
      description,
      logoUrl,
      tags,
      userId: req.userId!,
      links: { create: { platform: "WEBSITE", url: link } },
    },
    include: { ...listingInclude, upvotes: { select: { userId: true } } },
  })

  res.status(201).json({ listing: serializeListing(listing) })
}

export async function toggleUpvote(req: Request, res: Response) {
  const listingId = req.params.id as string

  const listing = await prisma.listing.findUnique({ where: { id: listingId } })
  if (!listing) {
    throw new AppError("Listing not found", 404)
  }

  const existing = await prisma.upvote.findUnique({
    where: { listingId_userId: { listingId, userId: req.userId! } },
  })

  if (existing) {
    await prisma.$transaction([
      prisma.upvote.delete({ where: { id: existing.id } }),
      prisma.listing.update({
        where: { id: listingId },
        data: { upvoteCount: { decrement: 1 } },
      }),
    ])
    return res.json({ upvoted: false })
  }

  await prisma.$transaction([
    prisma.upvote.create({ data: { listingId, userId: req.userId! } }),
    prisma.listing.update({
      where: { id: listingId },
      data: { upvoteCount: { increment: 1 } },
    }),
  ])
  res.json({ upvoted: true })
}
