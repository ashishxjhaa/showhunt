"use client"

import Image from "next/image"
import { ArrowBigUp, Bookmark, Heart, SquareArrowOutUpRight, Tags } from "lucide-react"
import { motion } from "motion/react"

export interface ListingProject {
    id: string
    name: string
    description: string
    link: string
    logoUrl: string
    tags: string[]
    upvotes: number
    hearts: number
    saves: number
    hasUpvoted: boolean
    hasHearted: boolean
    hasSaved: boolean
    user: { fullName: string }
    createdAt?: string | Date
}

interface ProjectListingCardProps {
    project: ListingProject
    rank?: number
    isAuthenticated?: boolean
    onUpvote: (id: string) => void
    onHeart: (id: string) => void
    onSave: (id: string) => void
    onRequireAuth?: () => void
    showCounts?: boolean
}

export default function ProjectListingCard({
    project,
    rank,
    isAuthenticated = true,
    onUpvote,
    onHeart,
    onSave,
    onRequireAuth,
    showCounts = true,
}: ProjectListingCardProps) {
    const guardAction = (action: () => void) => {
        if (!isAuthenticated) {
            onRequireAuth?.()
            return
        }
        action()
    }

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
                            src={project.logoUrl}
                            alt={project.name}
                            width={48}
                            height={48}
                            className="h-full w-full object-cover"
                        />
                    </div>
                    <div className="min-w-0 flex-1">
                        <a
                            href={project.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group/link inline-flex items-center gap-1 font-semibold text-[var(--paper-ink)] transition-colors hover:text-[#FF8162]"
                        >
                            {project.name}
                            <SquareArrowOutUpRight className="h-4 w-4 opacity-0 transition-opacity group-hover/link:opacity-100" />
                        </a>
                        <p className="mt-0.5 text-sm leading-relaxed text-[var(--paper-muted)]">
                            {project.description}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-1.5">
                            <Tags className="h-3.5 w-3.5 text-[var(--paper-muted)]" />
                            {project.tags.map((tag) => (
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
                    <EngagementButton
                        icon={ArrowBigUp}
                        count={project.upvotes}
                        active={project.hasUpvoted}
                        showCount={showCounts}
                        label="Upvote"
                        onClick={() => guardAction(() => onUpvote(project.id))}
                    />
                    <EngagementButton
                        icon={Heart}
                        count={project.hearts}
                        active={project.hasHearted}
                        showCount={showCounts}
                        label="Heart"
                        onClick={() => guardAction(() => onHeart(project.id))}
                    />
                    <EngagementButton
                        icon={Bookmark}
                        count={project.saves}
                        active={project.hasSaved}
                        showCount={showCounts}
                        label="Save"
                        onClick={() => guardAction(() => onSave(project.id))}
                    />
                </div>
            </div>
        </div>
    )
}

function EngagementButton({
    icon: Icon,
    count,
    active,
    showCount,
    label,
    onClick,
}: {
    icon: typeof ArrowBigUp
    count: number
    active: boolean
    showCount: boolean
    label: string
    onClick: () => void
}) {
    return (
        <motion.button
            type="button"
            whileTap={{ scale: 0.9 }}
            transition={{ type: "spring", stiffness: 500, damping: 22 }}
            onClick={onClick}
            className={`flex flex-col items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-xl border cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF8162]/40 ${
                active
                    ? "border-[#FF8162] bg-[var(--paper-accent-soft)] text-[#FF8162]"
                    : "border-[var(--paper-border)] text-[var(--paper-muted)] hover:border-[#FF8162]/50 hover:bg-[var(--paper-accent-soft)]"
            }`}
            aria-label={label}
        >
            <Icon className={`h-4 w-4 ${active ? "fill-current" : ""}`} />
            {showCount && (
                <span className="mt-0.5 text-xs font-medium tabular-nums">{count}</span>
            )}
        </motion.button>
    )
}
