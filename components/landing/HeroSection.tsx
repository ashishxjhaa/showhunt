import Link from "next/link"
import { ArrowRight } from "lucide-react"
import InteractiveListingCard from "./InteractiveListingCard"
import LandingSection from "./LandingSection"

export default function HeroSection() {
  return (
    <LandingSection className="pt-28 sm:pt-32">
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <p className="mb-4 text-sm font-medium tracking-wide text-[#FF8162] select-none">
            Product launch platform for builders
          </p>
          <h1 className="text-4xl font-semibold leading-[1.08] tracking-tight text-[var(--paper-ink)] sm:text-5xl lg:text-[3.5rem]">
            Launch where builders actually show up.
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-[var(--paper-muted)] sm:text-lg">
            List your side project, get real upvotes and saves from developers, not just a badge on your README.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/signup"
              className="paper-btn-primary inline-flex h-11 items-center justify-center gap-2 px-6 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF8162]/40"
            >
              List your project
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/listings"
              className="paper-btn-outline inline-flex h-11 items-center justify-center px-6 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF8162]/40"
            >
              Browse listings
            </Link>
          </div>

          <p className="mt-6 text-sm text-[var(--paper-muted)]">
            Free to list. No credit card. Built for indie hackers.
          </p>
        </div>

        <div className="relative mx-auto w-full max-w-md lg:max-w-none">
          <div className="paper-sheet absolute inset-x-4 top-6 h-full rotate-[-2deg] opacity-50" />
          <div className="paper-sheet absolute inset-x-2 top-3 h-full rotate-[1deg] opacity-70" />

          <div className="relative">
            <InteractiveListingCard
              name="ShipFast"
              description="The launch toolkit indie hackers use to announce, track, and grow their side projects."
              logoUrl="/BackIt.png"
              tags={["SaaS", "DevTools"]}
              initialUpvotes={142}
              initialHearts={89}
              initialSaves={34}
              rank={1}
            />
          </div>
        </div>
      </div>
    </LandingSection>
  )
}
