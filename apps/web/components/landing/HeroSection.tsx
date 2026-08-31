import Link from "next/link"
import InteractiveListingCard from "./InteractiveListingCard"
import { AnimatedList } from "./AnimatedList"

const heroListings = [
  {
    name: "Zuno",
    description: "Zuno is a full-stack AI website builder that enables users to generate websites.",
    logoUrl: "/zuno.svg",
    tags: ["AI", "SaaS"],
    initialUpvotes: 142,
    initialComments: 36,
  },
  {
    name: "DevDocify",
    description: "Auto-generate beautiful documentation for your GitHub repos in seconds.",
    logoUrl: "/github.svg",
    tags: ["Dev Tools", "AI"],
    initialUpvotes: 87,
    initialComments: 21,
  },
  {
    name: "PixelPaws",
    description: "A cozy puzzle game where you solve levels with an army of cats.",
    logoUrl: "/gaming.svg",
    tags: ["Gaming"],
    initialUpvotes: 63,
    initialComments: 12,
  },
]

export default function HeroSection() {
  return (
    <section className="relative flex min-h-screen items-center overflow-hidden pt-28 pb-16 sm:pb-20">
      {/* Pink gradient beam background */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 w-full sm:w-[65%]">
        <div className="absolute right-[-15%] top-[-25%] h-[150%] w-[85%] rotate-[20deg] bg-gradient-to-b from-[#F770E3]/45 via-[#DA5CC7]/22 to-transparent blur-2xl" />
        <div className="absolute inset-0 bg-gradient-to-bl from-[#F770E3]/30 via-[#FA9CEC]/14 to-transparent" />
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-5 sm:px-10">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left: copy */}
          <div>
            <h1 className="text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.4rem]">
              <span className="block text-[#171717]">Launch product</span>
              <span className="block text-[#A3A3A3]">in minutes with AI</span>
            </h1>

            <p className="mt-5 max-w-md text-base leading-relaxed text-[var(--paper-muted)] sm:text-lg">
              List side projects and early products &amp; get discovered.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/listings"
                className="paper-btn-primary inline-flex h-11 items-center justify-center px-7 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DA5CC7]/40"
              >
                Browse all product
              </Link>
            </div>
          </div>

          {/* Right: card deck, cycles by itself */}
          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <AnimatedList className="relative" delay={2500}>
              {heroListings.map((listing) => (
                <InteractiveListingCard key={listing.name} {...listing} />
              ))}
            </AnimatedList>
          </div>
        </div>
      </div>
    </section>
  )
}
