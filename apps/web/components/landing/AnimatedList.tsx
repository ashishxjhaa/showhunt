"use client"

import { Children, useEffect, useState, type ReactNode } from "react"
import { AnimatePresence, motion } from "motion/react"
import { cn } from "@/lib/utils"

interface AnimatedListProps {
  children: ReactNode
  className?: string
  /** Time in ms between card switches */
  delay?: number
}

/** Cards cycle in a deck: every `delay` ms the next card slides up front
 *  and the oldest floats away. Pauses on hover. */
export function AnimatedList({ children, className, delay = 5000 }: AnimatedListProps) {
  const items = Children.toArray(children)
  // Start with the full deck so visitors see multiple cards right away
  const [entries, setEntries] = useState<{ id: number; itemIndex: number }[]>(() =>
    items.map((_, i) => ({ id: i, itemIndex: (i + 1) % items.length }))
  )
  const [hovered, setHovered] = useState(false)

  useEffect(() => {
    if (hovered) return // paused on hover
    const timer = setInterval(() => {
      setEntries((prev) => {
        const nextItemIndex = (prev[prev.length - 1].itemIndex + 1) % items.length
        return [...prev, { id: prev[prev.length - 1].id + 1, itemIndex: nextItemIndex }].slice(
          -items.length
        )
      })
    }, delay)
    return () => clearInterval(timer)
  }, [delay, items.length, hovered])

  return (
    <div
      className={cn("relative h-64 w-full sm:h-56", className)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <AnimatePresence initial={false}>
        {entries.map((entry, i) => {
          const offset = entries.length - 1 - i // 0 = front card
          return (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 36, scale: 0.97 }}
              animate={{
                opacity: offset === 0 ? 1 : offset === 1 ? 0.7 : 0.45,
                y: 28 - offset * 14,
                scale: 1 - offset * 0.05,
                pointerEvents: offset === 0 ? "auto" : "none",
              }}
              exit={{ opacity: 0, y: -12, scale: 0.94 }}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
              style={{ zIndex: 3 - offset }}
              className="absolute inset-x-0 top-0"
            >
              {items[entry.itemIndex]}
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
