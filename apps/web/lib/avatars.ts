import { Style, Avatar } from "@dicebear/core"
import gaze from "@dicebear/styles/gaze.json" with { type: "json" }

/** Curated seeds for the 20 Gaze + Electric options users can pick. */
export const AVATAR_SEEDS = [
    "ember",
    "volt",
    "neon",
    "pulse",
    "spark",
    "flare",
    "bolt",
    "prism",
    "flux",
    "glow",
    "arc",
    "beam",
    "nova",
    "ion",
    "quark",
    "plasma",
    "zenith",
    "orbit",
    "comet",
    "radar",
] as const

export type AvatarSeed = (typeof AVATAR_SEEDS)[number]

export function toAvatarId(seed: AvatarSeed): string {
    return `gaze:${seed}`
}

export const AVATAR_IDS = AVATAR_SEEDS.map(toAvatarId)

export function isAvatarId(value: string | null | undefined): value is string {
    return !!value && AVATAR_IDS.includes(value)
}

export function seedFromAvatarId(id: string): AvatarSeed | null {
    if (!id.startsWith("gaze:")) return null
    const seed = id.slice(5)
    return (AVATAR_SEEDS as readonly string[]).includes(seed)
        ? (seed as AvatarSeed)
        : null
}

/** Electric preset colors + built-in Gaze animation. */
const ELECTRIC_ANIMATED = {
    backgroundColor: ["0f0f12"],
    bodyColor: ["ff2e88", "00e5ff", "7cff00", "ffe600", "ff6a00", "b400ff"],
    tags: ["animation"],
} as const

const style = new Style(gaze)
const dataUriCache = new Map<string, string>()

export function createAvatarSvg(seed: string, size = 96): string {
    const avatar = new Avatar(style, {
        seed,
        size,
        idRandomization: true,
        ...ELECTRIC_ANIMATED,
    })
    return avatar.toString()
}

export function createAvatarDataUri(seed: string, size = 96): string {
    const key = `${seed}:${size}`
    const cached = dataUriCache.get(key)
    if (cached) return cached

    const avatar = new Avatar(style, {
        seed,
        size,
        ...ELECTRIC_ANIMATED,
    })
    const uri = avatar.toDataUri()
    dataUriCache.set(key, uri)
    return uri
}

export function defaultSeedFor(fallback: string): AvatarSeed {
    let hash = 0
    for (const ch of fallback) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0
    return AVATAR_SEEDS[hash % AVATAR_SEEDS.length]
}

/** Resolve stored avatar to a Gaze seed (ignores legacy JPG paths). */
export function resolveAvatarSeed(
    stored: string | null | undefined,
    fallback: string
): AvatarSeed {
    const fromStored = stored ? seedFromAvatarId(stored) : null
    if (fromStored) return fromStored
    return defaultSeedFor(fallback)
}
