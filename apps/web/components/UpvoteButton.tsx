"use client"

import { useEffect, useState, type MouseEvent } from "react"
import { ArrowBigUp } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import { cn } from "@/lib/utils"

const BURST_DOTS = [
    { x: 0, y: -14, delay: 0 },
    { x: 12, y: -8, delay: 0.02 },
    { x: 12, y: 8, delay: 0.04 },
    { x: 0, y: 14, delay: 0.02 },
    { x: -12, y: 8, delay: 0.04 },
    { x: -12, y: -8, delay: 0.02 },
] as const

interface UpvoteButtonProps {
    upvoted: boolean
    count: number
    showCount?: boolean
    disabled?: boolean
    className?: string
    iconClassName?: string
    onClick: (e: MouseEvent<HTMLButtonElement>) => void
}

/**
 * Twitter-like upvote: icon pop + brief ring + soft particle burst.
 * No confetti — border/text only, no pink fill background.
 */
export default function UpvoteButton({
    upvoted,
    count,
    showCount = true,
    disabled,
    className,
    iconClassName = "h-4 w-4",
    onClick,
}: UpvoteButtonProps) {
    const [burstKey, setBurstKey] = useState(0)
    const [prevUpvoted, setPrevUpvoted] = useState(upvoted)

    useEffect(() => {
        if (upvoted && !prevUpvoted) {
            setBurstKey((k) => k + 1)
        }
        setPrevUpvoted(upvoted)
    }, [upvoted, prevUpvoted])

    return (
        <motion.button
            type="button"
            whileTap={{ scale: 0.9 }}
            transition={{ type: "spring", stiffness: 500, damping: 22 }}
            onClick={onClick}
            aria-label="Upvote"
            aria-pressed={upvoted}
            disabled={disabled}
            className={cn(
                "relative flex cursor-pointer flex-col items-center justify-center rounded-[8px] border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DA5CC7]/40 disabled:opacity-60",
                upvoted
                    ? "border-[#DA5CC7] text-[#DA5CC7]"
                    : "border-[var(--paper-border)] text-[var(--paper-muted)] hover:border-[#DA5CC7]/50 hover:text-[#DA5CC7]",
                className
            )}
        >
            <span className="relative flex items-center justify-center">
                <AnimatePresence>
                    {burstKey > 0 &&
                        BURST_DOTS.map((dot, i) => (
                            <motion.span
                                key={`dot-${burstKey}-${i}`}
                                initial={{ x: 0, y: 0, scale: 0.6, opacity: 0.9 }}
                                animate={{
                                    x: dot.x,
                                    y: dot.y,
                                    scale: 0,
                                    opacity: 0,
                                }}
                                transition={{
                                    duration: 0.4,
                                    delay: dot.delay,
                                    ease: [0.22, 1, 0.36, 1],
                                }}
                                className="pointer-events-none absolute h-1 w-1 rounded-full bg-[#DA5CC7]"
                                aria-hidden
                            />
                        ))}
                </AnimatePresence>

                <motion.span
                    key={upvoted ? "on" : "off"}
                    initial={upvoted ? { scale: 0.55 } : false}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 520, damping: 16 }}
                    className="relative z-[1] flex"
                >
                    <ArrowBigUp
                        className={cn(iconClassName, upvoted && "fill-current")}
                    />
                </motion.span>
            </span>

            {showCount && (
                <span className="mt-0.5 text-xs font-medium tabular-nums">{count}</span>
            )}
        </motion.button>
    )
}
