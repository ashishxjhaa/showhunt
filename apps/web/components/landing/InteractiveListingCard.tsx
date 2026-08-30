"use client"

import { useState } from "react"
import { motion } from "motion/react"
import { ArrowBigUp, MessageSquare, Tags } from "lucide-react"
import Image from "next/image"

interface InteractiveListingCardProps {
  name: string
  description: string
  logoUrl: string
  tags: string[]
  initialUpvotes?: number
  initialComments?: number
  className?: string
}

export default function InteractiveListingCard({
  name,
  description,
  logoUrl,
  tags,
  initialUpvotes = 24,
  initialComments = 8,
  className = "",
}: InteractiveListingCardProps) {
  const [upvotes, setUpvotes] = useState(initialUpvotes)
  const [comments, setComments] = useState(initialComments)
  const [hasUpvoted, setHasUpvoted] = useState(false)
  const [hasCommented, setHasCommented] = useState(false)

  const fireUpvoteConfetti = async (event: React.MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    // Loaded on first click, not in the initial bundle
    const confetti = (await import("canvas-confetti")).default
    confetti({
      particleCount: 45,
      spread: 70,
      startVelocity: 28,
      scalar: 0.9,
      ticks: 120,
      origin: {
        x: (rect.left + rect.width / 2) / window.innerWidth,
        y: (rect.top + rect.height / 2) / window.innerHeight,
      },
      colors: ["#DA5CC7", "#F770E3", "#FA9CEC", "#FAE6F8", "#171717"],
    })
  }

  return (
    <div className={`paper-sheet-static relative w-full overflow-hidden p-4 sm:p-5 ${className}`}>
      <div className="flex gap-3 sm:gap-4">
        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-[var(--paper-border)] bg-[var(--paper-accent-soft)]">
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
                className="rounded-full bg-[var(--paper-accent-soft)] px-2 py-0.5 text-xs text-[var(--paper-accent-hot)] select-none"
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
          onClick={(event) => {
            setHasUpvoted((v) => !v)
            setUpvotes((n) => (hasUpvoted ? n - 1 : n + 1))
            if (!hasUpvoted) fireUpvoteConfetti(event)
          }}
        />
        <EngagementButton
          icon={MessageSquare}
          count={comments}
          active={hasCommented}
          label="Comment"
          onClick={() => {
            setHasCommented((v) => !v)
            setComments((n) => (hasCommented ? n - 1 : n + 1))
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
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void
}) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.9 }}
      transition={{ type: "spring", stiffness: 500, damping: 22 }}
      onClick={onClick}
      className={`flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DA5CC7]/40 ${
        active
          ? "border-[var(--paper-accent)] bg-[var(--paper-accent-soft)] text-[var(--paper-accent)]"
          : "border-[var(--paper-border)] text-[var(--paper-muted)] hover:border-[var(--paper-accent)]/50 hover:bg-[var(--paper-accent-soft)]"
      }`}
      aria-label={label}
    >
      <Icon className={`h-4 w-4 ${active && label === "Upvote" ? "fill-current" : ""}`} />
      <span className="text-xs font-medium tabular-nums">{count}</span>
    </motion.button>
  )
}
