'use client'

import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useListings, useTags } from "@/lib/queries/hooks"
import { useListingsMutations } from "@/lib/queries/mutations"
import { listingsKey } from "@/lib/queries/keys"
import { sortByTrending } from "@/lib/ranking"
import { cn } from "@/lib/utils"
import { ProjectCardSkeleton } from "./ProjectCardSkeleton"
import ProjectListingCard from "./ProjectListingCard"

interface ListingsPageProps {
    searchQuery: string
    isAuthenticated: boolean
}

const ListingsPage = ({ searchQuery, isAuthenticated }: ListingsPageProps) => {
    const router = useRouter()
    const [activeTag, setActiveTag] = useState<string | null>(null)
    const [debouncedQuery, setDebouncedQuery] = useState(searchQuery)

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300)
        return () => clearTimeout(timer)
    }, [searchQuery])

    const filters = useMemo(
        () => ({ tag: activeTag, q: debouncedQuery }),
        [activeTag, debouncedQuery]
    )
    const { data, isLoading } = useListings(filters)
    const { upvote } = useListingsMutations(listingsKey(filters))
    const { data: curatedTags } = useTags()

    const listings = data?.listings ?? []
    const isFiltered = !!activeTag || !!debouncedQuery.trim()
    const visibleListings = useMemo(
        () => (isFiltered ? listings : sortByTrending(listings)),
        [listings, isFiltered]
    )

    const handleRequireAuth = () => {
        toast.error("Please log in to upvote listings")
        router.push("/signin")
    }

    return (
        <div className="px-5 py-8 sm:px-8 sm:py-10">
            <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
                <button
                    type="button"
                    onClick={() => setActiveTag(null)}
                    className={cn(
                        'shrink-0 rounded-full border px-3 py-1.5 text-sm transition-colors',
                        !activeTag
                            ? 'border-[#7C3AED] bg-[var(--paper-accent-soft)] font-medium text-[#5B21B6]'
                            : 'border-[var(--paper-border)] bg-white text-[var(--paper-muted)] hover:border-[#7C3AED]/50'
                    )}
                >
                    All
                </button>
                {(curatedTags ?? []).map((tag) => (
                    <button
                        key={tag}
                        type="button"
                        onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                        className={cn(
                            'shrink-0 rounded-full border px-3 py-1.5 text-sm transition-colors',
                            activeTag === tag
                                ? 'border-[#7C3AED] bg-[var(--paper-accent-soft)] font-medium text-[#5B21B6]'
                                : 'border-[var(--paper-border)] bg-white text-[var(--paper-muted)] hover:border-[#7C3AED]/50'
                        )}
                    >
                        {tag}
                    </button>
                ))}
            </div>

            {isLoading ? (
                <div className="paper-sheet-list">
                    {[...Array(5)].map((_, i) => (
                        <ProjectCardSkeleton key={i} />
                    ))}
                </div>
            ) : visibleListings.length > 0 ? (
                <div className="paper-sheet-list">
                    {visibleListings.map((l, index) => (
                        <ProjectListingCard
                            key={l.id}
                            listing={l}
                            rank={isFiltered ? undefined : index + 1}
                            isAuthenticated={isAuthenticated}
                            onUpvote={(id) => upvote.mutate(id)}
                            onRequireAuth={handleRequireAuth}
                        />
                    ))}
                </div>
            ) : isFiltered ? (
                <p className="text-center text-[var(--paper-muted)]">
                    No listings match your search.
                </p>
            ) : (
                <p className="text-center text-[var(--paper-muted)]">No listings yet</p>
            )}
        </div>
    )
}

export default ListingsPage
