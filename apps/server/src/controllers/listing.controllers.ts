import type { Request, Response } from "express"
import { prisma } from "../lib/prisma"
import { AppError } from "../lib/errors"
import { deleteObject } from "../lib/s3"
import { generateMetadata, scrapePage } from "../lib/deepseek"
import { CURATED_TAGS } from "../lib/tags"
import type { CreateListingBody, UpdateListingBody } from "../lib/schema"
import type { Prisma } from "../generated/prisma/client"

function serializeListing(
  listing: Prisma.ListingGetPayload<{
    include: {
      user: { select: { fullName: true } }
      upvotes: { select: { userId: true } }
      links: true
      photos: true
      _count: { select: { comments: true } }
    }
  }>
) {
  return {
    id: listing.id,
    name: listing.name,
    description: listing.description,
    logoUrl: listing.logoUrl,
    videoUrl: listing.videoUrl,
    photos: [...listing.photos]
      .sort((a, b) => a.position - b.position)
      .map((p) => p.url),
    isOpenSource: listing.isOpenSource,
    repoUrl: listing.repoUrl,
    tags: listing.tags,
    upvotes: listing.upvoteCount,
    comments: listing._count.comments,
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
  photos: { orderBy: { position: "asc" as const } },
  _count: { select: { comments: true } },
} as const


export async function getListings(req: Request, res: Response) {
  const { tag, q, page: pageRaw, limit: limitRaw } = req.query as {
    tag?: string
    q?: string
    page?: string
    limit?: string
  }

  const page = Math.max(1, Number.parseInt(pageRaw ?? "1", 10) || 1)
  const limit = Math.min(50, Math.max(1, Number.parseInt(limitRaw ?? "10", 10) || 10))
  const skip = (page - 1) * limit

  const where: Prisma.ListingWhereInput = {}
  if (tag) {
    where.tags = { has: tag }
  }
  const search = typeof q === "string" ? q.trim() : ""
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ]
  }

  const isFiltered = !!tag || !!search
  const orderBy: Prisma.ListingOrderByWithRelationInput[] = isFiltered
    ? [{ createdAt: "desc" }]
    : [{ upvoteCount: "desc" }, { createdAt: "desc" }]

  const [listings, total] = await prisma.$transaction([
    prisma.listing.findMany({
      where,
      include: listingInclude,
      orderBy,
      skip,
      take: limit,
    }),
    prisma.listing.count({ where }),
  ])

  const totalPages = Math.max(1, Math.ceil(total / limit))

  res.json({
    listings: listings.map(serializeListing),
    total,
    page,
    limit,
    totalPages,
  })
}

export async function getSimilarListings(req: Request, res: Response) {
  const listingId = req.params.id as string

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { id: true, tags: true },
  })
  if (!listing) {
    throw new AppError("Listing not found", 404)
  }

  if (listing.tags.length === 0) {
    res.json({ listings: [] })
    return
  }

  const candidates = await prisma.listing.findMany({
    where: {
      id: { not: listingId },
      tags: { hasSome: listing.tags },
    },
    include: listingInclude,
    take: 24,
  })

  const tagSet = new Set(listing.tags)
  const ranked = candidates
    .map((candidate) => ({
      candidate,
      overlap: candidate.tags.filter((t) => tagSet.has(t)).length,
    }))
    .sort((a, b) => {
      if (a.overlap !== b.overlap) return b.overlap - a.overlap
      if (a.candidate.upvoteCount !== b.candidate.upvoteCount) {
        return b.candidate.upvoteCount - a.candidate.upvoteCount
      }
      return b.candidate.createdAt.getTime() - a.candidate.createdAt.getTime()
    })
    .slice(0, 4)
    .map(({ candidate }) => serializeListing(candidate))

  res.json({ listings: ranked })
}

export async function getMyListings(req: Request, res: Response) {
  const listings = await prisma.listing.findMany({
    where: { userId: req.userId },
    include: listingInclude,
    orderBy: { createdAt: "desc" },
  })

  res.json({ listings: listings.map(serializeListing) })
}

export async function getTags(_req: Request, res: Response) {
  res.json({ tags: CURATED_TAGS })
}

export async function enrichListing(req: Request, res: Response) {
  const { url } = req.body as { url: string }

  const page = await scrapePage(url)
  const metadata = await generateMetadata(page, url)

  // Name + description only; logo and tags are filled by the user
  res.json({
    name: metadata.name,
    description: metadata.description,
  })
}

export async function createListing(req: Request, res: Response) {
  const {
    name,
    description,
    link,
    logoUrl,
    videoUrl,
    photos,
    tags,
    isOpenSource,
    repoUrl,
    socialLinks,
  } = req.body as CreateListingBody

  const listing = await prisma.listing.create({
    data: {
      name,
      description,
      logoUrl,
      videoUrl: videoUrl ?? null,
      tags,
      isOpenSource: isOpenSource ?? false,
      repoUrl: repoUrl ?? null,
      userId: req.userId!,
      links: {
        create: [
          { platform: "WEBSITE" as const, url: link },
          ...(socialLinks ?? []),
        ],
      },
      photos: photos
        ? { create: photos.map((url: string, position: number) => ({ url, position })) }
        : undefined,
    },
    include: listingInclude,
  })

  res.status(201).json({ listing: serializeListing(listing) })
}

export async function updateListing(req: Request, res: Response) {
  const listingId = req.params.id as string
  const body = req.body as UpdateListingBody

  const existing = await prisma.listing.findUnique({ where: { id: listingId } })
  if (!existing) {
    throw new AppError("Listing not found", 404)
  }
  if (existing.userId !== req.userId) {
    throw new AppError("You can only edit your own listings", 403)
  }

  const operations: Prisma.PrismaPromise<unknown>[] = []

  const data: Prisma.ListingUpdateInput = {}
  if (body.name !== undefined) data.name = body.name
  if (body.description !== undefined) data.description = body.description
  if (body.logoUrl !== undefined) data.logoUrl = body.logoUrl
  if (body.videoUrl !== undefined) data.videoUrl = body.videoUrl
  if (body.tags !== undefined) data.tags = { set: body.tags }
  if (body.isOpenSource !== undefined) data.isOpenSource = body.isOpenSource
  if (body.repoUrl !== undefined) data.repoUrl = body.repoUrl

  if (Object.keys(data).length > 0) {
    operations.push(prisma.listing.update({ where: { id: listingId }, data }))
  }

  if (body.link !== undefined) {
    operations.push(
      prisma.listingLink.upsert({
        where: { listingId_platform: { listingId, platform: "WEBSITE" } },
        update: { url: body.link },
        create: { listingId, platform: "WEBSITE", url: body.link },
      })
    )
  }

  // Replace all non-website links with the submitted set
  if (body.socialLinks !== undefined) {
    operations.push(
      prisma.listingLink.deleteMany({
        where: { listingId, platform: { not: "WEBSITE" } },
      })
    )
    if (body.socialLinks.length > 0) {
      operations.push(
        prisma.listingLink.createMany({
          data: body.socialLinks.map((l) => ({ listingId, platform: l.platform, url: l.url })),
        })
      )
    }
  }

  if (body.photos !== undefined) {
    operations.push(prisma.photo.deleteMany({ where: { listingId } }))
    if (body.photos.length > 0) {
      operations.push(
        prisma.photo.createMany({
          data: body.photos.map((url, position) => ({ listingId, url, position })),
        })
      )
    }
  }

  await prisma.$transaction(operations)

  const updated = await prisma.listing.findUnique({
    where: { id: listingId },
    include: {
      ...listingInclude,
      upvotes: { where: { userId: req.userId }, select: { userId: true } },
    },
  })

  res.json({ listing: updated ? serializeListing(updated) : null })
}

export async function deleteListing(req: Request, res: Response) {
  const listingId = req.params.id as string

  const existing = await prisma.listing.findUnique({
    where: { id: listingId },
    include: { photos: true },
  })
  if (!existing) {
    throw new AppError("Listing not found", 404)
  }
  if (existing.userId !== req.userId) {
    throw new AppError("You can only delete your own listings", 403)
  }

  // Relations cascade, so this also removes links, photos, upvotes, comments
  await prisma.listing.delete({ where: { id: listingId } })

  // Best-effort media cleanup; the DB row is already gone
  const bucket = process.env.S3_BUCKET_NAME ?? ""
  const prefix = `https://s3.${process.env.AWS_REGION ?? "ap-south-1"}.amazonaws.com/${bucket}/`
  const urls = [existing.logoUrl, existing.videoUrl, ...existing.photos.map((p) => p.url)]
  await Promise.allSettled(
    urls
      .filter((u): u is string => typeof u === "string" && u.startsWith(prefix))
      .map((u) => deleteObject(u.slice(prefix.length)))
  )

  res.json({ deleted: true })
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

export async function getListing(req: Request, res: Response) {
  const listingId = req.params.id as string

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    include: {
      ...listingInclude,
      upvotes: {
        where: { userId: req.userId ?? "__none__" },
        select: { userId: true },
      },
    },
  })
  if (!listing) {
    throw new AppError("Listing not found", 404)
  }

  res.json({ listing: serializeListing(listing) })
}

export async function getComments(req: Request, res: Response) {
  const listingId = req.params.id as string

  const listing = await prisma.listing.findUnique({ where: { id: listingId }, select: { id: true } })
  if (!listing) {
    throw new AppError("Listing not found", 404)
  }

  const comments = await prisma.comment.findMany({
    where: { listingId },
    include: {
      user: { select: { id: true, fullName: true, avatarUrl: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  res.json({
    comments: comments.map((c) => ({
      id: c.id,
      content: c.content,
      createdAt: c.createdAt,
      user: {
        id: c.user.id,
        fullName: c.user.fullName,
        avatarUrl: c.user.avatarUrl,
      },
    })),
  })
}

export async function createComment(req: Request, res: Response) {
  const listingId = req.params.id as string
  const { content } = req.body as { content: string }

  const listing = await prisma.listing.findUnique({ where: { id: listingId }, select: { id: true } })
  if (!listing) {
    throw new AppError("Listing not found", 404)
  }

  const comment = await prisma.comment.create({
    data: {
      content,
      listingId,
      userId: req.userId!,
    },
    include: {
      user: { select: { id: true, fullName: true, avatarUrl: true } },
    },
  })

  res.status(201).json({
    comment: {
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt,
      user: {
        id: comment.user.id,
        fullName: comment.user.fullName,
        avatarUrl: comment.user.avatarUrl,
      },
    },
  })
}
