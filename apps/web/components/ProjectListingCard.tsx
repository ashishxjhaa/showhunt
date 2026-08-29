"use client"

import Image from "next/image"
import { ArrowBigUp, SquareArrowOutUpRight, Tags } from "lucide-react"
import { motion } from "motion/react"
import type { ReactNode } from "react"
import type { Listing } from "@/lib/queries/types"

interface ProjectListingCardProps {
    listing: Listing
    rank?: number
    isAuthenticated?: boolean
    onUpvote: (id: string) => void
    onRequireAuth?: () => void
    showCounts?: boolean
    actionSlot?: ReactNode
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
    const guardAction = (action: () => void) => {
        if (!isAuthenticated) {
            onRequireAuth?.()
            return
        }
        action()
    }

    const primaryLink =
        listing.links.find((l) => l.platform === "WEBSITE")?.url ??
        listing.links[0]?.url ??
        "#"

    return (
        <div className="relative paper-sheet-static p-4 sm:p-5 transition-colors hover:border-[#FF8162]/25">
            {rank !== undefined && rank <= 3 && (
                <div className="absolute -left-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#FF8162] to-[#F12711] text-xs font-semibold text-white shadow-sm">
                    #{rank}
                </div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                <div className="flex flex-1 gap-3 sm:gap-4">
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
                            className="group/link inline-flex items-center gap-1 font-semibold text-[var(--paper-ink)] transition-colors hover:text-[#FF8162]"
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
                                    className="rounded-full bg-[var(--paper-accent-soft)] px-2 py-0.5 text-xs text-[#F12711]"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-2 sm:gap-3">
                    {actionSlot}
                    <motion.button
                        type="button"
                        whileTap={{ scale: 0.9 }}
                        transition={{ type: "spring", stiffness: 500, damping: 22 }}
                        onClick={() => guardAction(() => onUpvote(listing.id))}
                        aria-label="Upvote"
                        className={`flex flex-col items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-xl border cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF8162]/40 ${
                            listing.hasUpvoted
                                ? "border-[#FF8162] bg-[var(--paper-accent-soft)] text-[#FF8162]"
                                : "border-[var(--paper-border)] text-[var(--paper-muted)] hover:border-[#FF8162]/50 hover:bg-[var(--paper-accent-soft)]"
                        }`}
                    >
                        <ArrowBigUp className={`h-4 w-4 ${listing.hasUpvoted ? "fill-current" : ""}`} />
                        {showCounts && (
                            <span className="mt-0.5 text-xs font-medium tabular-nums">{listing.upvotes}</span>
                        )}
                    </motion.button>
                </div>
            </div>
        </div>
    )
}
