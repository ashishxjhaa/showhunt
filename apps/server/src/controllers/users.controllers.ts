import type { Request, Response } from "express"
import { prisma } from "../lib/prisma"
import { getUserActivity } from "../lib/activity"
import { AppError } from "../lib/errors"
import { listingInclude, serializeListing } from "./listing.controllers"
import { normalizeUsername } from "../lib/username"

const PUBLIC_USER_SELECT = {
  id: true,
  fullName: true,
  username: true,
  avatarUrl: true,
  bio: true,
  twitterUrl: true,
  githubUrl: true,
  portfolioUrl: true,
  linkedinUrl: true,
  state: true,
  techStack: true,
  createdAt: true,
} as const

export async function getPublicUser(req: Request, res: Response) {
  const username = normalizeUsername(String(req.params.username ?? ""))
  if (!username) {
    throw new AppError("User not found", 404)
  }

  const user = await prisma.user.findUnique({
    where: { username },
    select: PUBLIC_USER_SELECT,
  })
  if (!user?.username) {
    throw new AppError("User not found", 404)
  }

  const [listings, activity] = await Promise.all([
    prisma.listing.findMany({
      where: { userId: user.id },
      include: listingInclude(req.userId),
      orderBy: { createdAt: "desc" },
    }),
    getUserActivity(user.id),
  ])

  res.json({
    user,
    activity,
    listings: listings.map(serializeListing),
  })
}

export async function getBuildersMap(_req: Request, res: Response) {
  const rows = await prisma.user.findMany({
    select: {
      username: true,
      fullName: true,
      avatarUrl: true,
      state: true,
    },
    orderBy: { createdAt: "asc" },
  })

  const builders = rows.flatMap((row) => {
    if (!row.username || !row.state) return []
    return [
      {
        username: row.username,
        fullName: row.fullName,
        avatarUrl: row.avatarUrl,
        state: row.state,
      },
    ]
  })

  res.json({ builders })
}
