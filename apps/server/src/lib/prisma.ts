import { PrismaNeon } from "@prisma/adapter-neon"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"
import { PrismaClient } from "../generated/prisma/client"

function databaseUrl() {
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error("DATABASE_URL is not set")
  }
  return url
}

function useNeonAdapter(url: string) {
  if (process.env.DATABASE_ADAPTER === "pg") return false
  if (process.env.DATABASE_ADAPTER === "neon") return true
  return /\.neon\.(tech|build)/.test(url)
}

function createPrisma() {
  const url = databaseUrl()

  if (useNeonAdapter(url)) {
    // Neon suspends idle databases and drops connections; recycle pooled
    // clients quickly and swallow stale-connection errors instead of crashing
    const adapter = new PrismaNeon(
      {
        connectionString: url,
        max: 5,
        idleTimeoutMillis: 30_000,
        connectionTimeoutMillis: 15_000,
      },
      { onPoolError: () => {}, onConnectionError: () => {} }
    )
    const client = new PrismaClient({ adapter })
    setInterval(() => {
      client.$queryRaw`SELECT 1`.catch(() => {})
    }, 60_000).unref()
    return client
  }

  const pool = new Pool({ connectionString: url })
  return new PrismaClient({ adapter: new PrismaPg(pool) })
}

export const prisma = createPrisma()
