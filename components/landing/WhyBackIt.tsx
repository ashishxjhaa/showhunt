import { Heart, Rocket, Zap } from "lucide-react"
import LandingSection from "./LandingSection"

const reasons = [
  {
    icon: Rocket,
    title: "Free to list, always",
    description:
      "No pay-to-play launch slots. List your project today and keep it live. Product Hunt charges attention, we charge nothing.",
  },
  {
    icon: Zap,
    title: "Three real signals",
    description:
      "Upvotes show interest, hearts show love, saves show intent. Each one tells you something different about your audience.",
  },
  {
    icon: Heart,
    title: "Built for indie hackers",
    description:
      "Side projects, weekend builds, early MVPs. BackIt is where builders discover what other builders are shipping.",
  },
]

export default function WhyBackIt() {
  return (
    <LandingSection id="features">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-semibold tracking-tight text-[var(--paper-ink)] sm:text-4xl">
          Why builders choose BackIt
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-[var(--paper-muted)]">
          A launch platform that respects your time and your audience.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        {reasons.map((reason) => {
          const Icon = reason.icon
          return (
            <div key={reason.title} className="paper-sheet p-6">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--paper-accent-soft)] text-[#FF8162]">
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
