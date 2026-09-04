// Shared ICE server list for browser ↔ Railway WebRTC.

export type VoiceIceServer = {
  urls: string | string[]
  username?: string
  credential?: string
}

const DEFAULT_STUN: VoiceIceServer = {
  urls: "stun:stun.l.google.com:19302",
}

/** Parse NEXT_PUBLIC_VOICE_ICE_SERVERS JSON (same shape as server ICE_SERVERS). */
export function loadVoiceIceServers(): VoiceIceServer[] {
  const raw = process.env.NEXT_PUBLIC_VOICE_ICE_SERVERS?.trim()
  if (!raw) return [DEFAULT_STUN]

  try {
    const parsed = JSON.parse(raw) as unknown
    const list = Array.isArray(parsed) ? parsed : [parsed]
    const servers: VoiceIceServer[] = []

    for (const item of list) {
      if (typeof item === "string" && item.trim()) {
        servers.push({ urls: item.trim() })
        continue
      }
      if (!item || typeof item !== "object") continue
      const entry = item as Record<string, unknown>
      const urls = entry.urls ?? entry.url
      if (typeof urls !== "string" && !Array.isArray(urls)) continue
      const server: VoiceIceServer = {
        urls: Array.isArray(urls)
          ? urls.filter((u): u is string => typeof u === "string")
          : urls,
      }
      if (typeof entry.username === "string") server.username = entry.username
      if (typeof entry.credential === "string") server.credential = entry.credential
      else if (typeof entry.password === "string") server.credential = entry.password
      servers.push(server)
    }

    return servers.length > 0 ? servers : [DEFAULT_STUN]
  } catch {
    return [DEFAULT_STUN]
  }
}
