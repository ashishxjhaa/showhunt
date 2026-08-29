"use client"

import { useState } from "react"
import { motion } from "motion/react"
import { ArrowBigUp, Bookmark, Heart, Tags } from "lucide-react"
import Image from "next/image"

interface InteractiveListingCardProps {
  name: string
  description: string
  logoUrl: string
  tags: string[]
  initialUpvotes?: number
  initialHearts?: number
  initialSaves?: number
  rank?: number
  className?: string
}

export default function InteractiveListingCard({
  name,
  description,
  logoUrl,
  tags,
  initialUpvotes = 24,
  initialHearts = 12,
  initialSaves = 8,
  rank,
  className = "",
}: InteractiveListingCardProps) {
  const [upvotes, setUpvotes] = useState(initialUpvotes)
  const [hearts, setHearts] = useState(initialHearts)
  const [saves, setSaves] = useState(initialSaves)
  const [hasUpvoted, setHasUpvoted] = useState(false)
  const [hasHearted, setHasHearted] = useState(false)
  const [hasSaved, setHasSaved] = useState(false)

  return (
    <div className={`paper-sheet p-4 sm:p-5 ${className}`}>
      {rank !== undefined && rank <= 3 && (
        <div className="absolute -left-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#7C3AED] to-[#5B21B6] text-xs font-semibold text-white shadow-sm select-none">
          #{rank}
        </div>
      )}

      <div className="flex gap-3 sm:gap-4">
        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-[var(--paper-border)]">
          <Image src={logoUrl} alt={name} width={48} height={48} className="h-full w-full object-cover" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-[var(--paper-ink)]">{name}</h3>
          <p className="mt-0.5 text-sm leading-relaxed text-[var(--paper-muted)]">{description}</p>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <Tags className="h-3.5 w-3.5 text-[var(--paper-muted)] select-none" />
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-[var(--paper-accent-soft)] px-2 py-0.5 text-xs text-[#5B21B6] select-none"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 flex justify-end gap-2 sm:gap-3">
        <EngagementButton
          icon={ArrowBigUp}
          count={upvotes}
          active={hasUpvoted}
          label="Upvote"
          onClick={() => {
            setHasUpvoted((v) => !v)
            setUpvotes((n) => (hasUpvoted ? n - 1 : n + 1))
          }}
        />
        <EngagementButton
          icon={Heart}
          count={hearts}
          active={hasHearted}
          label="Heart"
          onClick={() => {
            setHasHearted((v) => !v)
            setHearts((n) => (hasHearted ? n - 1 : n + 1))
          }}
        />
        <EngagementButton
          icon={Bookmark}
          count={saves}
          active={hasSaved}
          label="Save"
          onClick={() => {
            setHasSaved((v) => !v)
            setSaves((n) => (hasSaved ? n - 1 : n + 1))
          }}
        />
      </div>
    </div>
  )
}

function EngagementButton({
  icon: Icon,
  count,
  active,
  label,
  onClick,
}: {
  icon: typeof ArrowBigUp
  count: number
  active: boolean
  label: string
  onClick: () => void
}) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.9 }}
      transition={{ type: "spring", stiffness: 500, damping: 22 }}
      onClick={onClick}
      className={`flex flex-col items-center justify-center w-14 h-14 rounded-xl border cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED]/40 ${
        active
          ? "border-[#7C3AED] bg-[var(--paper-accent-soft)] text-[#7C3AED]"
          : "border-[var(--paper-border)] text-[var(--paper-muted)] hover:border-[#7C3AED]/50 hover:bg-[var(--paper-accent-soft)]"
      }`}
      aria-label={label}
    >
      <Icon className={`h-4 w-4 ${active ? "fill-current" : ""}`} />
      <span className="mt-0.5 text-xs font-medium tabular-nums">{count}</span>
    </motion.button>
  )
}
