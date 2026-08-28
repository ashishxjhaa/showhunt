import { PrismaNeon } from "@prisma/adapter-neon"
import { PrismaClient } from "../generated/prisma/client"

function databaseUrl() {
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error("DATABASE_URL is not set")
  }
  return url
}

const adapter = new PrismaNeon({ connectionString: databaseUrl() })

export const prisma = new PrismaClient({ adapter })
