import { PrismaNeon } from "@prisma/adapter-neon"
import { PrismaClient } from "../generated/prisma/client"

function databaseUrl() {
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error("DATABASE_URL is not set")
  }
  return url
}

// Neon suspends idle databases and drops their connections; recycle pooled
// clients quickly and swallow stale-connection errors instead of crashing
const adapter = new PrismaNeon(
  {
    connectionString: databaseUrl(),
    max: 5,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 15_000,
  },
  { onPoolError: () => {}, onConnectionError: () => {} }
)

export const prisma = new PrismaClient({ adapter })

// Keep the database awake so pooled connections stay valid
setInterval(() => {
  prisma.$queryRaw`SELECT 1`.catch(() => {})
}, 60_000).unref()
