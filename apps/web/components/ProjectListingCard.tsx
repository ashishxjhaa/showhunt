"use client"

import Image from "next/image"
import {
    Apple,
    ArrowBigUp,
    ChevronDown,
    Flame,
    Github,
    Globe,
    Link as LinkIcon,
    Play,
    SquareArrowOutUpRight,
    Tags,
    Twitter,
    Youtube,
} from "lucide-react"
import { motion } from "motion/react"
import { useState, type ComponentType } from "react"
import type { Listing } from "@/lib/queries/types"
import { cn } from "@/lib/utils"

const PLATFORM_META: Record<string, { label: string; icon: ComponentType<{ className?: string }> }> = {
    WEBSITE: { label: "Website", icon: Globe },
    GITHUB: { label: "GitHub", icon: Github },
    PLAY_STORE: { label: "Play Store", icon: Play },
    APP_STORE: { label: "App Store", icon: Apple },
    X_TWITTER: { label: "X (Twitter)", icon: Twitter },
    PRODUCT_HUNT: { label: "Product Hunt", icon: Flame },
    YOUTUBE: { label: "YouTube", icon: Youtube },
    OTHER: { label: "Link", icon: LinkIcon },
}

function youtubeEmbedUrl(url: string): string | null {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/)
    return match?.[1] ? `https://www.youtube.com/embed/${match[1]}` : null
}

interface ProjectListingCardProps {
    listing: Listing
    rank?: number
    isAuthenticated?: boolean
    onUpvote: (id: string) => void
    onRequireAuth?: () => void
    showCounts?: boolean
    actionSlot?: React.ReactNode
}

export default function ProjectListingCard({
    listing,
    rank,
    isAuthenticated = true,
    onUpvote,
    onRequireAuth,
    showCounts = true,
    actionSlot,
}: ProjectListingCardProps) {
    const [expanded, setExpanded] = useState(false)

    const guardAction = (action: () => void) => {
        if (!isAuthenticated) {
            onRequireAuth?.()
            return
        }
        action()
    }

    const toggle = () => setExpanded((v) => !v)

    const primaryLink =
        listing.links.find((l) => l.platform === "WEBSITE")?.url ??
        listing.links[0]?.url ??
        "#"

    return (
        <div className="relative paper-sheet-static p-4 sm:p-5 transition-colors hover:border-[#F953C6]/25">
            {rank !== undefined && rank <= 3 && (
                <div className="absolute -left-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#F953C6] to-[#B91D73] text-xs font-semibold text-white shadow-sm">
                    #{rank}
                </div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                <div
                    className="flex flex-1 cursor-pointer gap-3 sm:gap-4"
                    onClick={toggle}
                    aria-expanded={expanded}
                >
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-[var(--paper-border)]">
                        <Image
                            src={listing.logoUrl}
                            alt={listing.name}
                            width={48}
                            height={48}
                            className="h-full w-full object-cover"
                        />
                    </div>
                    <div className="min-w-0 flex-1">
                        <a
                            href={primaryLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="group/link inline-flex items-center gap-1 font-semibold text-[var(--paper-ink)] transition-colors hover:text-[#F953C6]"
                        >
                            {listing.name}
                            <SquareArrowOutUpRight className="h-4 w-4 opacity-0 transition-opacity group-hover/link:opacity-100" />
                        </a>
                        <p className="mt-0.5 text-sm leading-relaxed text-[var(--paper-muted)]">
                            {listing.description}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-1.5">
                            <Tags className="h-3.5 w-3.5 text-[var(--paper-muted)]" />
                            {listing.tags.map((tag) => (
                                <span
                                    key={tag}
                                    className="rounded-full bg-[var(--paper-accent-soft)] px-2 py-0.5 text-xs text-[#B91D73]"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-2 sm:gap-3">
                    {actionSlot}
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation()
                            toggle()
                        }}
                        aria-label={expanded ? "Collapse preview" : "Expand preview"}
                        aria-expanded={expanded}
                        className={cn(
                            'flex h-10 w-10 items-center justify-center rounded-xl border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F953C6]/40 sm:hidden',
                            expanded
                                ? 'border-[#F953C6] bg-[var(--paper-accent-soft)] text-[#F953C6]'
                                : 'border-[var(--paper-border)] text-[var(--paper-muted)] hover:border-[#F953C6]/50'
                        )}
                    >
                        <ChevronDown className={cn('h-4 w-4 transition-transform', expanded && 'rotate-180')} />
                    </button>
                    <motion.button
                        type="button"
                        whileTap={{ scale: 0.9 }}
                        transition={{ type: "spring", stiffness: 500, damping: 22 }}
                        onClick={(e) => {
                            e.stopPropagation()
                            guardAction(() => onUpvote(listing.id))
                        }}
                        aria-label="Upvote"
                        className={`flex flex-col items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-xl border cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F953C6]/40 ${
                            listing.hasUpvoted
                                ? "border-[#F953C6] bg-[var(--paper-accent-soft)] text-[#F953C6]"
                                : "border-[var(--paper-border)] text-[var(--paper-muted)] hover:border-[#F953C6]/50 hover:bg-[var(--paper-accent-soft)]"
                        }`}
                    >
                        <ArrowBigUp className={`h-4 w-4 ${listing.hasUpvoted ? "fill-current" : ""}`} />
                        {showCounts && (
                            <span className="mt-0.5 text-xs font-medium tabular-nums">{listing.upvotes}</span>
                        )}
                    </motion.button>
                </div>
            </div>

            {expanded && (
                <div className="mt-4 space-y-4 border-t border-[var(--paper-border)] pt-4">
                    {listing.photos.length > 0 && (
                        <div className="flex gap-3 overflow-x-auto pb-1">
                            {listing.photos.map((url, index) => (
                                <a
                                    key={url}
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="shrink-0"
                                >
                                    <Image
                                        src={url}
                                        alt={`${listing.name} screenshot ${index + 1}`}
                                        width={280}
                                        height={160}
                                        className="h-40 w-auto rounded-xl border border-[var(--paper-border)] object-cover"
                                    />
                                </a>
                            ))}
                        </div>
                    )}

                    {listing.videoUrl &&
                        (youtubeEmbedUrl(listing.videoUrl) ? (
                            <div className="aspect-video w-full overflow-hidden rounded-xl border border-[var(--paper-border)]">
                                <iframe
                                    src={youtubeEmbedUrl(listing.videoUrl)!}
                                    title={`${listing.name} video`}
                                    className="h-full w-full"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            </div>
                        ) : (
                            <video
                                src={listing.videoUrl}
                                controls
                                className="w-full rounded-xl border border-[var(--paper-border)]"
                            />
                        ))}

                    <div className="flex flex-wrap items-center gap-2">
                        {listing.links.map((link) => {
                            const meta = PLATFORM_META[link.platform] ?? PLATFORM_META.OTHER
                            const Icon = meta.icon
                            return (
                                <a
                                    key={link.platform + link.url}
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="group/link inline-flex items-center gap-1.5 rounded-full border border-[var(--paper-border)] bg-white px-3 py-1.5 text-xs font-medium text-[var(--paper-muted)] transition-colors hover:border-[#F953C6]/50 hover:text-[#F953C6]"
                                >
                                    <Icon className="h-3.5 w-3.5" />
                                    {meta.label}
                                    <SquareArrowOutUpRight className="h-3 w-3 opacity-0 transition-opacity group-hover/link:opacity-100" />
                                </a>
                            )
                        })}
                    </div>

                    {listing.createdAt && (
                        <p className="text-xs text-[var(--paper-muted)]">
                            Launched{' '}
                            {new Date(listing.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                            })}
                        </p>
                    )}
                </div>
            )}
        </div>
    )
}
