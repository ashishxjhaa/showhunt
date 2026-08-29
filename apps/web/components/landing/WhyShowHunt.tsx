import {
  ArrowBigUp,
  FolderSearch,
  Hammer,
  Layers,
  Rocket,
  Sparkles,
} from "lucide-react"
import LandingSection from "./LandingSection"

const reasons = [
  {
    icon: Rocket,
    title: "Free to list, always",
    description:
      "No pay-to-play launch slots and no featured pricing. Your project stays live because it deserves to, not because you paid.",
  },
  {
    icon: Sparkles,
    title: "AI-assisted listings",
    description:
      "Paste your project link and ShowHunt drafts the name, description, tags, and logo for you. Edit anything before it goes live.",
  },
  {
    icon: ArrowBigUp,
    title: "Community-ranked feed",
    description:
      "The trending feed is ordered by real upvotes from real builders. No sponsored placements, no secret algorithms.",
  },
  {
    icon: FolderSearch,
    title: "Tag-based discovery",
    description:
      "Fifteen curated tags keep the feed clean and make it easy for the right people to find exactly your kind of project.",
  },
  {
    icon: Layers,
    title: "Rich quick previews",
    description:
      "Every listing can carry screenshots, a demo video, and all your links, expandable right inside the feed.",
  },
  {
    icon: Hammer,
    title: "Built for side projects",
    description:
      "Weekend builds, early MVPs, open source tools. Ship early, iterate in public, and grow with every update.",
  },
]

export default function WhyShowHunt() {
  return (
    <LandingSection id="features">
      <div className="mb-12 text-center">
        <h2 className="text-3xl font-semibold tracking-tight text-[var(--paper-ink)] sm:text-4xl">
          Why builders choose ShowHunt
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-[var(--paper-muted)]">
          A launch platform that respects your time, your product, and your audience.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {reasons.map((reason) => {
          const Icon = reason.icon
          return (
            <div
              key={reason.title}
              className="rounded-2xl border border-[var(--paper-border)] bg-white p-6 transition-colors hover:border-[#F953C6]/30"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--paper-accent-soft)] text-[#F953C6]">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-[var(--paper-ink)]">{reason.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--paper-muted)]">{reason.description}</p>
            </div>
          )
        })}
      </div>
    </LandingSection>
  )
}
