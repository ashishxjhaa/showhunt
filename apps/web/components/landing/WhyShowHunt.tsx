"use client"

import { useEffect, useRef } from "react"
import {
  ArrowBigUp,
  FolderSearch,
  Hammer,
  Layers,
  Rocket,
  Sparkles,
} from "lucide-react"
import LandingSection from "./LandingSection"

const themeColors = ["#E93545", "#3559E9", "#1CB061"]

function IconTile({ icon: Icon, color }: { icon: typeof Rocket; color: string }) {
  const tileRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    tileRef.current
      ?.querySelectorAll("path, circle, line, polyline, rect, polygon, ellipse")
      .forEach((el) => el.setAttribute("pathLength", "100"))
  }, [])

  return (
    <div
      ref={tileRef}
      className="flex h-11 w-11 items-center justify-center rounded-[12px] shadow-[0_10px_22px_-10px_rgba(20,30,60,0.35)]"
      style={{ backgroundColor: color }}
    >
      <Icon className="icon-draw h-5 w-5 text-white" />
    </div>
  )
}

const reasons = [
  {
    icon: Rocket,
    title: "Free to list, always",
    description:
      "No pay-to-play launch slots and no featured pricing. Your project stays live because it deserves to, not because you paid.",
    layout: "featured",
  },
  {
    icon: Sparkles,
    title: "AI-assisted listings",
    description:
      "Paste your project link and ShowHunt drafts the name, description, tags, and logo for you. Edit anything before it goes live.",
    layout: "small",
  },
  {
    icon: ArrowBigUp,
    title: "Community-ranked feed",
    description:
      "The trending feed is ordered by real upvotes from real builders. No sponsored placements, no secret algorithms.",
    layout: "small",
  },
  {
    icon: FolderSearch,
    title: "Tag-based discovery",
    description:
      "Fifteen curated tags keep the feed clean and make it easy for the right people to find exactly your kind of project.",
    layout: "small",
  },
  {
    icon: Layers,
    title: "Rich quick previews",
    description:
      "Every listing can carry screenshots, a demo video, and all your links, expandable right inside the feed.",
    layout: "small",
  },
  {
    icon: Hammer,
    title: "Built for side projects",
    description:
      "Weekend builds, early MVPs, open source tools. Ship early, iterate in public, and grow with every update.",
    layout: "banner",
  },
] as const

export default function WhyShowHunt() {
  return (
    <LandingSection id="features" className="landing-section--flush pb-0 sm:pb-0">
      <div className="mb-12 max-w-2xl">
        <h2 className="text-4xl font-semibold tracking-tight text-[var(--paper-ink)] sm:text-5xl lg:text-[56px] lg:leading-[1.1]">
          <span className="block">Still not convinced?</span>
          <span className="block">Here&apos;s more you can do.</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
        {reasons.map((reason, index) => {
          const color = themeColors[index % themeColors.length]
          const number = `0${index + 1}`

          if (reason.layout === "featured") {
            return (
              <div
                key={reason.title}
                className="group relative rounded-2xl bg-[#F7F7F7] p-6 sm:col-span-2 sm:p-8 lg:col-span-4"
              >
                <span className="absolute right-6 top-5 text-2xl font-medium tracking-tight text-[#D1D1D1] select-none">
                  {number}
                </span>
                <div className="max-w-sm">
                  <IconTile icon={reason.icon} color={color} />
                  <h3 className="mt-5 text-lg font-semibold tracking-tight text-[var(--paper-ink)]">
                    {reason.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--paper-muted)]">
                    {reason.description}
                  </p>
                </div>
              </div>
            )
          }

          if (reason.layout === "banner") {
            return (
              <div
                key={reason.title}
                className="group relative flex flex-col gap-5 rounded-2xl bg-[#F7F7F7] p-6 sm:col-span-2 sm:flex-row sm:items-center sm:p-8 lg:col-span-6"
              >
                <IconTile icon={reason.icon} color={color} />
                <div className="max-w-xl">
                  <h3 className="text-lg font-semibold tracking-tight text-[var(--paper-ink)]">
                    {reason.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--paper-muted)]">
                    {reason.description}
                  </p>
                </div>
                <span className="ml-auto hidden text-4xl font-medium tracking-tight text-[#D1D1D1] select-none sm:block">
                  {number}
                </span>
              </div>
            )
          }

          return (
            <div
              key={reason.title}
              className="group relative rounded-2xl bg-[#F7F7F7] p-6 lg:col-span-2"
            >
              <span className="absolute right-6 top-5 text-xl font-medium tracking-tight text-[#D1D1D1] select-none">
                {number}
              </span>
              <IconTile icon={reason.icon} color={color} />
              <h3 className="mt-5 text-base font-semibold tracking-tight text-[var(--paper-ink)]">
                {reason.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--paper-muted)]">
                {reason.description}
              </p>
            </div>
          )
        })}
      </div>
    </LandingSection>
  )
}
