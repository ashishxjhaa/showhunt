// Turn spoken / partial URLs into full https links.

export function normalizeVoiceUrl(raw: string): string {
  let s = raw.trim()
  if (!s) return ""

  // Spoken forms
  s = s.replace(/\s+dot\s+/gi, ".")
  s = s.replace(/\s+slash\s+/gi, "/")
  s = s.replace(/\s+/g, "")

  // Already absolute
  if (/^https?:\/\//i.test(s)) return s

  // Protocol spoken without slashes: "https echo.com"
  s = s.replace(/^https?/i, "")
  s = s.replace(/^:+/, "")

  // Bare domain or path
  if (!s) return ""
  return `https://${s}`
}

export function looksLikeUrl(value: string): boolean {
  try {
    const u = new URL(value)
    return u.protocol === "http:" || u.protocol === "https:"
  } catch {
    return false
  }
}
