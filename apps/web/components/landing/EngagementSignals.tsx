"use client"

import { useState } from "react"
import { motion } from "motion/react"
import { ArrowBigUp, Bookmark, Heart } from "lucide-react"
import LandingSection from "./LandingSection"

const signals = [
  {
    icon: ArrowBigUp,
    label: "Upvote",
    verb: "Signals interest",
    description: "A quick tap to say \"this looks promising.\" Pushes your project up the feed.",
  },
  {
    icon: Heart,
    label: "Heart",
    verb: "Shows love",
    description: "Builders heart projects they genuinely admire. A stronger signal than a casual upvote.",
  },
  {
    icon: Bookmark,
    label: "Save",
    verb: "Marks intent",
    description: "Saved projects get revisited. The strongest signal that someone will come back.",
  },
]

export default function EngagementSignals() {
  const [active, setActive] = useState<string | null>(null)

  return (
    <LandingSection>
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-semibold tracking-tight text-[var(--paper-ink)] sm:text-4xl">
          Three signals. Three meanings.
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-[var(--paper-muted)]">
          Not vanity metrics, real feedback from real builders. Tap to try each one.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        {signals.map((signal) => {
          const Icon = signal.icon
          const isActive = active === signal.label
          return (
            <motion.button
              key={signal.label}
              type="button"
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 500, damping: 22 }}
              onClick={() => setActive(isActive ? null : signal.label)}
              className={`paper-sheet p-6 text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED]/40 ${
                isActive ? "border-[#7C3AED]/50 bg-[var(--paper-accent-soft)]" : ""
              }`}
            >
              <div
                className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl border transition-colors ${
                  isActive
                    ? "border-[#7C3AED] bg-[#7C3AED] text-white"
                    : "border-[var(--paper-border)] bg-[var(--paper-surface)] text-[#7C3AED]"
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? "fill-current" : ""}`} />
              </div>
              <p className="text-xs font-medium uppercase tracking-wider text-[#7C3AED] select-none">{signal.verb}</p>
              <h3 className="mt-1 text-base font-semibold text-[var(--paper-ink)]">{signal.label}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--paper-muted)]">{signal.description}</p>
            </motion.button>
          )
        })}
      </div>
    </LandingSection>
  )
}
