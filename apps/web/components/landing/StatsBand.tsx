import { Gift, Sparkles, TrendingUp } from "lucide-react"

const stats = [
  {
    icon: Gift,
    title: "Free forever",
    description: "No launch slots, no featured pricing, no credit card.",
  },
  {
    icon: Sparkles,
    title: "5 minutes to list",
    description: "AI drafts your name, description, tags, and logo from your link.",
  },
  {
    icon: TrendingUp,
    title: "Ranked by builders",
    description: "The trending feed is decided by real upvotes, never sponsorship.",
  },
]

export default function StatsBand() {
  return (
    <section className="border-y border-[var(--paper-border)] bg-white">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-5 py-10 sm:grid-cols-3 sm:px-8">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.title} className="flex items-start gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--paper-accent-soft)] text-[#F953C6]">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--paper-ink)]">{stat.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-[var(--paper-muted)]">{stat.description}</p>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}