import { prisma } from "./prisma"

export type ActivityDay = {
  date: string
  listings: number
  upvotes: number
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
export async function getUserActivity(userId: string): Promise<ActivityDay[]> {
  const since = new Date()
  since.setUTCDate(since.getUTCDate() - 15)
  since.setUTCHours(0, 0, 0, 0)

  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)

  const listings = await prisma.listing.findMany({
    where: { userId },
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

  return eachDayKey(since, today).map((date) => ({
    date,
    listings: listingsByDay.get(date) ?? 0,
    upvotes: upvotesByDay.get(date) ?? 0,
  }))
}
