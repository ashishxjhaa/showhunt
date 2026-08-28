import type { Request, Response } from "express"
import { prisma } from "../lib/prisma"
import { clearAuthCookie } from "../lib/auth"

export async function me(req: Request, res: Response) {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: {
      id: true,
      fullName: true,
      email: true,
      createdAt: true,
    },
  })
  if (!user) {
    return res.status(404).json({ error: "User not found" })
  }
  res.json({ user })
}

export async function signout(_req: Request, res: Response) {
  clearAuthCookie(res)
  res.json({ ok: true })
}
