export const USERNAME_PATTERN = /^[a-z0-9_]{3,20}$/

export const RESERVED_USERNAMES = new Set([
  "profile",
  "listings",
  "signin",
  "signup",
  "signout",
  "login",
  "register",
  "admin",
  "u",
  "api",
  "me",
  "settings",
  "auth",
  "users",
  "user",
  "browse",
  "upload",
  "about",
  "help",
  "support",
  "home",
  "www",
  "static",
  "assets",
  "public",
  "private",
  "showhunt",
])

export function normalizeUsername(value: string): string {
  return value.trim().toLowerCase()
}
