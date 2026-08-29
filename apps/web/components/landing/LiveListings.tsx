"use client"

import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { ArrowRight } from "lucide-react"
import { api } from "@/lib/api"
import ProjectListingCard from "@/components/ProjectListingCard"
import type { ListingsResponse } from "@/lib/queries/types"
import LandingSection from "./LandingSection"

export default function LiveListings() {
  const router = useRouter()

  const { data } = useQuery({
    queryKey: ["landing-listings"],
    queryFn: async () => {
      const res = await api.get<ListingsResponse>("/api/v1/listings")
      return res.data
    },
  })

  const listings = (data?.listings ?? []).slice(0, 3)

  return (
    <LandingSection id="feed">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-semibold tracking-tight text-[var(--paper-ink)] sm:text-4xl">
          Fresh from the feed
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-[var(--paper-muted)]">
          Real projects listed by real builders, straight from ShowHunt right now.
        </p>
      </div>

      {listings.length > 0 ? (
        <div className="mx-auto max-w-3xl space-y-3">
          {listings.map((listing) => (
            <ProjectListingCard
              key={listing.id}
              listing={listing}
              showCounts
              onUpvote={() => router.push("/signin")}
            />
          ))}
        </div>
      ) : (
        <div className="mx-auto max-w-3xl rounded-2xl border border-dashed border-[var(--paper-border)] bg-white p-10 text-center">
          <p className="text-[var(--paper-muted)]">The feed is waiting for its first launch.</p>
        </div>
      )}

      <div className="mt-8 text-center">
        <Link
          href="/listings"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#F953C6] transition-colors hover:text-[#B91D73]"
        >
          See all listings
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </LandingSection>
  )
}