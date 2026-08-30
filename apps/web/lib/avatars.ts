// Local 3D avatar set living in public/avatars, generated in one consistent style
export const AVATAR_PATHS = Array.from(
    { length: 20 },
    (_, i) => `/avatars/avatar-${String(i + 1).padStart(2, "0")}.jpg`
)

export function defaultAvatarFor(seed: string): string {
    let hash = 0
    for (const ch of seed) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0
    return AVATAR_PATHS[hash % AVATAR_PATHS.length]
}

// Stale remote URLs (old DiceBear defaults) fall back to a deterministic local pick
export function resolveAvatarSrc(stored: string | null | undefined, seed: string): string {
    if (stored?.startsWith("/avatars/")) return stored
    if (stored?.includes("googleusercontent.com")) return stored
    return defaultAvatarFor(seed)
}
