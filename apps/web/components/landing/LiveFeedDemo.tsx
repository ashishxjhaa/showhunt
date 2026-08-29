"use client"

import { motion } from "motion/react"
import { ArrowBigUp, Bookmark, Heart } from "lucide-react"
import Image from "next/image"
import LandingSection from "./LandingSection"

const feedItems = [
  {
    name: "CodeSnap",
    tag: "DevTools",
    upvotes: 98,
    logo: "/showcase.png",
    delay: 0,
  },
  {
    name: "PixelForge",
    tag: "Design",
    upvotes: 76,
    logo: "/showcase.png",
    delay: 0.12,
  },
  {
    name: "LaunchKit",
    tag: "Marketing",
    upvotes: 54,
    logo: "/showcase.png",
    delay: 0.24,
  },
  {
    name: "StackPilot",
    tag: "Open Source",
    upvotes: 41,
    logo: "/showcase.png",
    delay: 0.36,
  },
]

export default function LiveFeedDemo() {
  return (
    <LandingSection>
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-semibold tracking-tight text-[var(--paper-ink)] sm:text-4xl">
          The feed never sleeps
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-[var(--paper-muted)]">
          New projects surface every day. Upvotes push the best ones to the top.
        </p>
      </div>

      <div className="paper-sheet mx-auto max-w-lg overflow-hidden p-1">
        <div className="flex items-center gap-2 border-b border-[var(--paper-border)] px-4 py-3">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#7C3AED] opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#7C3AED]" />
          </span>
          <span className="text-xs font-medium text-[var(--paper-muted)] select-none">Live listings feed</span>
        </div>

        <div className="flex flex-col gap-2 p-3">
          {feedItems.map((item) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: item.delay, ease: [0.25, 0.1, 0.25, 1] }}
              className="flex items-center gap-3 rounded-xl border border-[var(--paper-border)] bg-[var(--paper-surface)] p-3 transition-colors hover:border-[#7C3AED]/30"
            >
              <div className="h-9 w-9 shrink-0 overflow-hidden rounded-lg border border-[var(--paper-border)]">
                <Image src={item.logo} alt={item.name} width={36} height={36} className="h-full w-full object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-[var(--paper-ink)]">{item.name}</span>
                  <span className="rounded-full bg-[var(--paper-accent-soft)] px-1.5 py-0.5 text-[10px] text-[#5B21B6] select-none">
                    {item.tag}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3 text-[var(--paper-muted)] select-none">
                <span className="flex items-center gap-1 text-xs tabular-nums">
                  <ArrowBigUp className="h-3.5 w-3.5" />
                  {item.upvotes}
                </span>
                <Heart className="h-3.5 w-3.5" />
                <Bookmark className="h-3.5 w-3.5" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </LandingSection>
  )
}
