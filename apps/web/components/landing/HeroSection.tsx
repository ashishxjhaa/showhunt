import Link from "next/link"
import { ArrowRight, Sparkles } from "lucide-react"

const mockListings = [
  {
    letter: "S",
    name: "ShipFast",
    description: "The launch toolkit indie hackers use to announce and grow their side projects.",
    tags: ["SaaS", "Dev Tools"],
    upvotes: 142,
    gradient: "from-[#F953C6] to-[#B91D73]",
  },
  {
    letter: "D",
    name: "DevDocify",
    description: "Auto-generate beautiful documentation for your GitHub repos in seconds.",
    tags: ["Dev Tools", "AI"],
    upvotes: 87,
    gradient: "from-[#B91D73] to-[#7C2D5E]",
  },
  {
    letter: "P",
    name: "PixelPaws",
    description: "A cozy puzzle game where you solve levels with an army of cats.",
    tags: ["Gaming"],
    upvotes: 63,
    gradient: "from-[#F9A8D4] to-[#F953C6]",
  },
]

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-32 pb-16 sm:pt-40 sm:pb-20">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-[#F953C6]/12 blur-[120px]"
      />

      <div className="relative mx-auto w-full max-w-6xl px-5 sm:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-[#F953C6]/25 bg-[var(--paper-accent-soft)] px-3.5 py-1.5 text-xs font-medium text-[#B91D73] select-none">
            <Sparkles className="h-3.5 w-3.5" />
            Built for indie hackers and founders
          </p>

          <h1 className="text-4xl font-semibold leading-[1.06] tracking-tight text-[var(--paper-ink)] sm:text-6xl">
            Launch your product to{" "}
            <span className="bg-gradient-to-r from-[#F953C6] to-[#B91D73] bg-clip-text text-transparent">
              builders who show up
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-[var(--paper-muted)] sm:text-lg">
            ShowHunt is a launch platform for side projects and early products. List in minutes, collect real upvotes, and get discovered by a community of builders.
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="paper-btn-primary inline-flex h-11 items-center justify-center gap-2 px-7 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F953C6]/40"
            >
              List your project
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/listings"
              className="paper-btn-outline inline-flex h-11 items-center justify-center px-7 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F953C6]/40"
            >
              Browse listings
            </Link>
          </div>

          <p className="mt-6 text-xs text-[var(--paper-muted)] select-none">
            Free to list · No credit card · AI-assisted setup
          </p>
        </div>

        <div className="relative mx-auto mt-16 max-w-4xl sm:mt-20">
          <div
            aria-hidden="true"
            className="absolute -inset-6 rounded-[2rem] bg-gradient-to-br from-[#F953C6]/20 via-transparent to-[#B91D73]/20 blur-2xl"
          />
          <div className="relative overflow-hidden rounded-2xl border border-[var(--paper-border)] bg-white shadow-[0_24px_70px_-24px_rgba(185,29,115,0.28)]">
            <div className="flex items-center gap-3 border-b border-[var(--paper-border)] bg-[var(--paper-bg)] px-4 py-3">
              <div className="flex gap-1.5 select-none">
                <span className="h-2.5 w-2.5 rounded-full bg-[#F953C6]/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#F9A8D4]/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#B91D73]/60" />
              </div>
              <div className="mx-auto flex h-6 w-56 items-center justify-center rounded-md border border-[var(--paper-border)] bg-white text-[10px] text-[var(--paper-muted)] select-none">
                showhunt.ashishjha.xyz
              </div>
              <div className="w-10" />
            </div>

            <div className="space-y-3 bg-[var(--paper-bg)] p-4 sm:p-5">
              <div className="flex items-center justify-between px-1 pb-1">
                <p className="text-sm font-semibold text-[var(--paper-ink)] select-none">Today on ShowHunt</p>
                <div className="hidden gap-1.5 sm:flex">
                  {["All", "SaaS", "AI", "Dev Tools"].map((tag, i) => (
                    <span
                      key={tag}
                      className={`rounded-full px-2.5 py-1 text-[10px] font-medium select-none ${
                        i === 0
                          ? "bg-[var(--paper-accent-soft)] text-[#B91D73]"
                          : "border border-[var(--paper-border)] bg-white text-[var(--paper-muted)]"
                      }`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {mockListings.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center gap-3 rounded-xl border border-[var(--paper-border)] bg-white p-3.5 sm:gap-4"
                >
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${item.gradient} text-base font-bold text-white select-none`}
                  >
                    {item.letter}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[var(--paper-ink)] select-none">{item.name}</p>
                    <p className="mt-0.5 truncate text-xs text-[var(--paper-muted)] select-none">{item.description}</p>
                    <div className="mt-1.5 hidden gap-1.5 sm:flex">
                      {item.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-[var(--paper-accent-soft)] px-2 py-0.5 text-[10px] text-[#B91D73] select-none"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex w-12 shrink-0 flex-col items-center rounded-lg border border-[#F953C6]/30 bg-[var(--paper-accent-soft)] py-1.5 select-none">
                    <span className="text-[10px] font-bold leading-none text-[#B91D73]">▲</span>
                    <span className="mt-0.5 text-xs font-semibold tabular-nums text-[#B91D73]">{item.upvotes}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

