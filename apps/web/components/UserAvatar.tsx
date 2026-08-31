"use client"

import { useMemo } from "react"
import { createAvatarSvg, resolveAvatarSeed } from "@/lib/avatars"
import { cn } from "@/lib/utils"

interface UserAvatarProps {
    avatarUrl?: string | null
    seed: string
    size?: number
    alt?: string
    className?: string
}

/** Always renders an animated Gaze + Electric avatar (inline SVG). */
export default function UserAvatar({
    avatarUrl,
    seed,
    size = 96,
    alt = "",
    className,
}: UserAvatarProps) {
    const svg = useMemo(() => {
        const gazeSeed = resolveAvatarSeed(avatarUrl, seed)
        return createAvatarSvg(gazeSeed, size)
    }, [avatarUrl, seed, size])

    return (
        <span
            role="img"
            aria-label={alt || undefined}
            aria-hidden={alt ? undefined : true}
            className={cn("block overflow-hidden [&_svg]:h-full [&_svg]:w-full", className)}
            style={{ width: size, height: size }}
            dangerouslySetInnerHTML={{ __html: svg }}
        />
    )
}
