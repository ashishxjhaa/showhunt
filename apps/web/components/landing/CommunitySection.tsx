import { Bookmark, Heart, TrendingUp, Users } from "lucide-react"
import LandingSection from "./LandingSection"

const items = [
  {
    icon: Users,
    title: "A growing community of builders",
    description: "Developers and founders sharing what they ship, every day.",
  },
  {
    icon: TrendingUp,
    title: "Engagement that compounds",
    description: "The more your project resonates, the more visible it becomes in the feed.",
  },
  {
    icon: Bookmark,
    title: "Projects saved for later",
    description: "Builders bookmark what interests them, a signal of lasting intent.",
  },
  {
    icon: Heart,
    title: "Signals that matter",
    description: "Upvotes, hearts, and saves. Real feedback, not vanity metrics.",
  },
]

export default function CommunitySection() {
  return (
    <LandingSection>
      <div className="paper-sheet p-8 sm:p-12">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-[var(--paper-ink)] sm:text-4xl">
            Built with community in mind
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-[var(--paper-muted)]">
            ShowHunt is where launches turn into conversations.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => {
            const Icon = item.icon
            return (
              <div
                key={item.title}
                className="rounded-xl border border-[var(--paper-border)] bg-[var(--paper-bg)] p-5 transition-colors hover:border-[#7C3AED]/30"
              >
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--paper-accent-soft)] text-[#7C3AED]">
                  <Icon className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-semibold text-[var(--paper-ink)]">{item.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-[var(--paper-muted)]">{item.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </LandingSection>
  )
}
