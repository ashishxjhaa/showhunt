// Clean spoken / STT email text into a usable address.

export function normalizeVoiceEmail(raw: string): string {
  let s = raw.trim().toLowerCase()
  if (!s) return ""

  // Spoken "at" / "dot"
  s = s.replace(/\s+at\s+/g, "@")
  s = s.replace(/\s+dot\s+/g, ".")
  s = s.replace(/\s*@\s*/g, "@")
  s = s.replace(/\s*\.\s*/g, ".")

  // "Ashish xyz jha@gmail.com" -> keep the token that has @
  if (s.includes("@") && /\s/.test(s)) {
    const withAt = s.split(/\s+/).find((t) => t.includes("@"))
    if (withAt) s = withAt
  }

  // Emails never contain spaces
  s = s.replace(/\s+/g, "")

  // Prefer a clear email substring if junk remains
  const match = s.match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i)
  return match?.[0] ?? s
}

export function looksLikeEmail(value: string): boolean {
  return /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(value)
}
