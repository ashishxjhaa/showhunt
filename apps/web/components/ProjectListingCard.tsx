"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { MessageSquare, SquareArrowOutUpRight } from "lucide-react"
import { motion } from "motion/react"
import type { Listing } from "@/lib/queries/types"
import UpvoteButton from "@/components/UpvoteButton"

interface ProjectListingCardProps {
    listing: Listing
    isAuthenticated?: boolean
    onUpvote: (id: string) => void
    onRequireAuth?: () => void
    showCounts?: boolean
    actionSlot?: React.ReactNode
}

const actionBtnClass =
    "flex w-12 h-12 sm:w-14 sm:h-14 flex-col items-center justify-center rounded-[8px] border cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DA5CC7]/40"

export default function ProjectListingCard({
    listing,
    isAuthenticated = true,
    onUpvote,
    onRequireAuth,
    showCounts = true,
    actionSlot,
}: ProjectListingCardProps) {
    const router = useRouter()

    const guardAction = (action: () => void) => {
        if (!isAuthenticated) {
            onRequireAuth?.()
            return
        }
        action()
    }

    return (
        <div
            className="group/card relative cursor-pointer rounded-[8px] bg-[var(--paper-surface)] p-4 transition-colors hover:bg-[#F7F7F8] sm:p-5"
            onClick={() => router.push(`/listings/${listing.id}`)}
        >
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                <div className="flex flex-1 gap-3 sm:gap-4">
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl">
                        <Image
                            src={listing.logoUrl}
                            alt={listing.name}
                            width={48}
                            height={48}
                            className="h-full w-full object-cover"
                        />
                    </div>
                    <div className="min-w-0 flex-1">
                        <h3 className="inline-flex items-center gap-1 font-semibold text-[var(--paper-ink)] transition-colors group-hover/card:text-[#DA5CC7]">
                            {listing.name}
                            <SquareArrowOutUpRight className="h-4 w-4 opacity-0 transition-opacity group-hover/card:opacity-100" />
                        </h3>
                        <p className="mt-0.5 text-sm leading-relaxed text-[var(--paper-muted)]">
                            {listing.description}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--paper-muted)]">
                            {listing.tags.map((tag) => (
                                <span key={tag} className="inline-flex items-center gap-1.5">
                                    <span className="h-1 w-1 rounded-full bg-[var(--paper-muted)]" />
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-2 sm:gap-3">
                    {actionSlot}
                    <UpvoteButton
                        upvoted={listing.hasUpvoted}
                        count={listing.upvotes}
                        showCount={showCounts}
                        className="h-12 w-12 sm:h-14 sm:w-14"
                        onClick={(e) => {
                            e.stopPropagation()
                            guardAction(() => onUpvote(listing.id))
                        }}
                    />
                    <motion.button
                        type="button"
                        whileTap={{ scale: 0.9 }}
                        transition={{ type: "spring", stiffness: 500, damping: 22 }}
                        onClick={(e) => {
                            e.stopPropagation()
                            router.push(`/listings/${listing.id}`)
                        }}
                        aria-label="Comments"
                        className={`${actionBtnClass} border-[var(--paper-border)] text-[var(--paper-muted)] hover:border-[#DA5CC7]/50 hover:text-[#DA5CC7]`}
                    >
                        <MessageSquare className="h-4 w-4" />
                        {showCounts && (
                            <span className="mt-0.5 text-xs font-medium tabular-nums">{listing.comments}</span>
                        )}
                    </motion.button>
                </div>
            </div>
        </div>
    )
}
