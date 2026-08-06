import { Plus, RadioTower, Rocket } from "lucide-react"
import LandingSection from "./LandingSection"

const steps = [
  {
    icon: Plus,
    step: "01",
    title: "Create your account",
    description: "Sign up in seconds. No onboarding maze, no sales call.",
  },
  {
    icon: Rocket,
    step: "02",
    title: "List your project",
    description: "Add your name, description, link, logo, and tags. Takes under 5 minutes.",
  },
  {
    icon: RadioTower,
    step: "03",
    title: "Get discovered",
    description: "Share your listing, collect upvotes and saves, and watch your project climb the feed.",
  },
]

export default function HowItWorks() {
  return (
    <LandingSection id="how-it-works">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-semibold tracking-tight text-[var(--paper-ink)] sm:text-4xl">
          From signup to launch in minutes
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-[var(--paper-muted)]">
          Three steps. No complexity.
        </p>
      </div>

      <div className="relative grid gap-6 md:grid-cols-3">
        <div className="absolute left-[16.67%] right-[16.67%] top-10 hidden h-px bg-[var(--paper-border)] md:block" />

        {steps.map((step) => {
          const Icon = step.icon
          return (
            <div key={step.title} className="relative flex flex-col items-center text-center">
              <div className="group relative z-10 mb-5 flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-[var(--paper-border)] bg-[var(--paper-surface)] transition-all duration-200 hover:border-[#FF8162] hover:border-solid">
                <Icon className="h-6 w-6 text-[#FF8162] transition-transform duration-200 group-hover:scale-105" />
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-[#FF8162] to-[#F12711] text-[9px] font-bold text-white select-none">
                  {step.step}
                </span>
              </div>
              <h3 className="text-base font-semibold text-[var(--paper-ink)]">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--paper-muted)]">{step.description}</p>
            </div>
          )
        })}
      </div>
    </LandingSection>
  )
}
