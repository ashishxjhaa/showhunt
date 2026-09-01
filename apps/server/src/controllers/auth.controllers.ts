import type { Request, Response } from "express"
import bcrypt from "bcrypt"
import { prisma } from "../lib/prisma"
import { createToken, setAuthCookie, clearAuthCookie } from "../lib/auth"
import { verifyGoogleIdToken } from "../lib/google"
import { AppError } from "../lib/errors"
import { defaultAvatarIdFor } from "../lib/schema"

const USER_SELECT = {
  id: true,
  fullName: true,
  email: true,
  avatarUrl: true,
  createdAt: true,
} as const

export async function signup(req: Request, res: Response) {
  const { fullName, email, password } = req.body

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    throw new AppError("An account with this email already exists", 409)
  }

  const hashed = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({
    data: {
      fullName,
      email,
      password: hashed,
      avatarUrl: defaultAvatarIdFor(email),
    },
    select: USER_SELECT,
  })

  setAuthCookie(res, createToken(user.id))
  res.status(201).json({ user })
}

export async function signin(req: Request, res: Response) {
  const { email, password } = req.body

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || !user.password) {
    throw new AppError("Invalid email or password", 401)
  }

  const valid = await bcrypt.compare(password, user.password)
  if (!valid) {
    throw new AppError("Invalid email or password", 401)
  }

  setAuthCookie(res, createToken(user.id))
  res.json({
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
    },
  })
}

export async function google(req: Request, res: Response) {
  const profile = await verifyGoogleIdToken(req.body.credential)

  let user = await prisma.user.findUnique({
    where: { googleId: profile.googleId },
  })

  if (!user) {
    // Link an existing email account, otherwise create a new user.
    user = await prisma.user.upsert({
      where: { email: profile.email },
      update: { googleId: profile.googleId },
      create: {
        fullName: profile.name,
        email: profile.email,
        googleId: profile.googleId,
        avatarUrl: defaultAvatarIdFor(profile.email),
      },
    })
  }

  // Backfill Gaze avatar for older accounts that never picked one.
  if (!user.avatarUrl?.startsWith("gaze:")) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { avatarUrl: defaultAvatarIdFor(user.email) },
    })
  }

  setAuthCookie(res, createToken(user.id))
  res.json({
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
    },
  })
}

export async function signout(_req: Request, res: Response) {
  clearAuthCookie(res)
  res.json({ ok: true })
}

export async function me(req: Request, res: Response) {
  let user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: USER_SELECT,
  })
  if (!user) {
    throw new AppError("User not found", 404)
  }

  // Ensure every profile has a Gaze avatar assigned.
  if (!user.avatarUrl?.startsWith("gaze:")) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { avatarUrl: defaultAvatarIdFor(user.email) },
      select: USER_SELECT,
    })
  }

  res.json({ user })
}

function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function eachDayKey(since: Date, today: Date): string[] {
  const keys: string[] = []
  const cursor = new Date(since)
  while (cursor <= today) {
    keys.push(toDateKey(cursor))
    cursor.setUTCDate(cursor.getUTCDate() + 1)
  }
  return keys
}

/** Daily listings created + upvotes received — last 15 days. */
export async function getMyActivity(req: Request, res: Response) {
  const since = new Date()
  since.setUTCDate(since.getUTCDate() - 15)
  since.setUTCHours(0, 0, 0, 0)

  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)

  const listings = await prisma.listing.findMany({
    where: { userId: req.userId },
    select: { id: true, createdAt: true },
  })
  const listingIds = listings.map((l) => l.id)

  const listingsByDay = new Map<string, number>()
  for (const listing of listings) {
    if (listing.createdAt < since) continue
    const key = toDateKey(listing.createdAt)
    listingsByDay.set(key, (listingsByDay.get(key) ?? 0) + 1)
  }

  const upvotesByDay = new Map<string, number>()
  if (listingIds.length > 0) {
    const upvotes = await prisma.upvote.findMany({
      where: {
        listingId: { in: listingIds },
        createdAt: { gte: since },
      },
      select: { createdAt: true },
    })

    for (const row of upvotes) {
      const key = toDateKey(row.createdAt)
      upvotesByDay.set(key, (upvotesByDay.get(key) ?? 0) + 1)
    }
  }

  const activity = eachDayKey(since, today).map((date) => ({
    date,
    listings: listingsByDay.get(date) ?? 0,
    upvotes: upvotesByDay.get(date) ?? 0,
  }))

  res.json({ activity })
}

export async function updateAvatar(req: Request, res: Response) {
  const { avatarUrl } = req.body

  const user = await prisma.user.update({
    where: { id: req.userId },
    data: { avatarUrl },
    select: USER_SELECT,
  })

  res.json({ user })
}
